import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../util/createUrqlClient";
import {useQuery } from "urql";
import { PostsDocument } from "../gql/graphql";
import { Layout } from "../components/layout";
import NextLink from 'next/link'
import { Link } from "@chakra-ui/react";
const Index = () => {
    const [{data}]=useQuery({
        query:PostsDocument,
        variables:{limit:6}
    })
return(
<Layout>
    <NextLink href="/create-post">
    <Link>create post</Link>
    </NextLink>
{!data ? null : data.posts.map((p)=><div key={p.id}>{p.title}</div>)}
</Layout>
)
}

export default withUrqlClient(createUrqlClient,{ssr:true})(Index);
