import { fetchExchange, stringifyVariables } from "urql";
import { Resolver, cacheExchange } from "@urql/exchange-graphcache";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../gql/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from 'next/router'

import {pipe, tap } from 'wonka';
import { Exchange } from 'urql';

//catch global graphql errors
 const errorExchange: Exchange =
 ({ forward }) =>
 (ops$) => {
   return pipe(
     forward(ops$),
     tap(({ error }) => {
       if (error?.message.includes("not authenticated")) {
         Router.replace("/login");
       }
     })
   );
 };



 const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isItInCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "posts" )
    info.partial=!isItInCache
    let hasMore=true
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey,fi.fieldKey) as string;
      const data=cache.resolve(key,"posts") as string[]
      const _hasMore=cache.resolve(key,"hasMore")
      if(!_hasMore){
        hasMore=_hasMore as boolean
      }
      results.push(...data);
    });

    return {
      __typename:"PaginatedPosts",
      hasMore,
      posts:results
    }
  };
};









export const createUrqlClient=(ssrExchange:any)=>({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
    },
    exchanges: [
      cacheExchange({
        keys:{
          PaginatedPosts:()=>null,
        },
        resolvers:{
          Query:{
            posts:cursorPagination()
          }
        },
       updates: {
        Mutation: {
           logout: (_result, args, cache, info) => {
          betterUpdateQuery<LogoutMutation, MeQuery>(
             cache,
            { query: MeDocument },
             _result,
          () => ({me:null})
          )
          },
  
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation,MeQuery>(
              cache,
              {query:MeDocument},
              _result,
              (result,query)=>{
              if(result.login.errors){
                return query
              }else{
                return {
                 me: result.login.user
                }
              }
              
            })
          },
  
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation,MeQuery>(
              cache,
              {query:MeDocument},
              _result,
              (result,query)=>{
              if(result.register.errors){
                return query
              }else{
                return {
                 me: result.register.user
                }
              }
              
            })
          },
        }
      }
  }),
  errorExchange,
  ssrExchange,
  fetchExchange
]
 });
  
  