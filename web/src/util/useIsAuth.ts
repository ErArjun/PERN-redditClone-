import { useRouter } from "next/router"
import { useEffect } from "react"
import { useQuery } from "urql"
import { MeDocument } from "../gql/graphql"

export const useIsAuth=()=>{
  const [{data,fetching}]=useQuery({ query:MeDocument})
  const router=useRouter()
  useEffect(()=>{
      if(!fetching && !data?.me){
        router.replace("/login?next=" + router.pathname)  //redirect to post after login
      }
  },[fetching,data,router])
}