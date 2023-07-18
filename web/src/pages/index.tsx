import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../util/createUrqlClient";
import {useQuery } from "urql";
import { PostsDocument } from "../gql/graphql";
import { Layout } from "../components/layout";
import NextLink from 'next/link'
import { Box, Button, Flex, Heading, Link, Stack,Text } from "@chakra-ui/react";
import { useState } from "react";
const Index = () => {
  const [variables, setVariables] = useState({
    limit: 5,
    cursor: null as null | string,
  });
  const [{data,fetching}]=useQuery({
        query:PostsDocument,
        variables,
    })

    if(!fetching && !data){
      return <div>query failed due to some reasons</div>
    }
return(
<Layout>
  <Flex justifyContent={"space-between"} alignItems={"center"} mb={4}>
    <Heading>RedditClone</Heading>
    <NextLink href="/create-post">
    <Link ml="auto">create post</Link>
    </NextLink>
    </Flex>
    
      {fetching && !data ?
       <div>Loading.....</div> : 
      (
      <Stack spacing={8}>
      {data.posts.posts.map((p)=>
      (
      <Box key={p.id} p={5} shadow='md' borderWidth='1px'>
      <Heading fontSize='xl'>{p.title}</Heading>
      <Text mt={4}>{p.textSnippet}</Text>
    </Box>
      ))} 
      </Stack>
)}

{data && data.posts.hasMore ? <Flex>
<Button 
onClick={() => {
  setVariables({
    limit: variables.limit,
    cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
  });
}}
m='auto' isLoading={fetching} mt={4}>Load more</Button>
</Flex>
: null}

</Layout>
)
}

export default withUrqlClient(createUrqlClient,{ssr:true})(Index);
