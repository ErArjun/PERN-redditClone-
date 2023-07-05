import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../util/createUrqlClient";
import {useQuery } from "urql";
import { PostsDocument } from "../gql/graphql";

const Index = () => {
    const [{data}]=useQuery({
        query:PostsDocument
    })
return(
<>
<NavBar/>
<div>hello world</div>
{!data ? null : data.posts.map((p)=><div key={p.id}>{p.title}</div>)}
</>
)
}

export default withUrqlClient(createUrqlClient,{ssr:true})(Index);
