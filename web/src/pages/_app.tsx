import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import { AppProps } from 'next/app';
import { Cache,QueryInput, cacheExchange } from '@urql/exchange-graphcache';
import { Client, Provider, Query, fetchExchange} from 'urql';
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../gql/graphql';


function betterUpdateQuery<Result,Query>(
  cache:Cache,
  qi:QueryInput,
  result:any,
  fn:(r:Result,q:Query)=>Query
){
  return cache.updateQuery(qi,(data)=>fn(result,data as any) as any)
}

const client = new Client({
  url: 'http://127.0.0.1:4000/graphql',
  exchanges: [fetchExchange,cacheExchange({
    updates: {
      Mutation: {
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
      },
  }
})],
  fetchOptions: {
    credentials: 'include',
  },
});


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
