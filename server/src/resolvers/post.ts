import { MyContext } from 'src/types'
import { Post } from '../entities/Post'
import { Arg,Ctx,Field,FieldResolver,InputType,Int,Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { isAuth } from '../middleware/isAuth'
import { dataSource } from '../config/dataSource'


@InputType()
class PostInput{
  @Field()
  title:string

  @Field()
  text:string
}

@ObjectType()
class PaginatedPosts{
  @Field(()=>[Post])
  posts:Post[]
  @Field()
  hasMore:boolean
}




@Resolver(Post)
export class PostResolver {
  @FieldResolver(()=>String)
    textSnippet(@Root() root: Post){
      return root.text.slice(0,50)
    }

  
  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit",()=>Int) limit:number,
    @Arg("cursor",()=>String,{nullable:true}) cursor:string | null
  ): Promise<PaginatedPosts> {
    const realLimit=Math.min(50,limit)
    const realLimitPlusOne=realLimit+1
    const qb=dataSource
             .getRepository(Post)
             .createQueryBuilder("p")
             .orderBy('"createdAt"',"DESC")
             .take(realLimitPlusOne)

       if(cursor){
        qb.where('"createdAt"< :cursor',{
          cursor:new Date(parseInt(cursor))
        })
       }

       const posts=await qb.getMany()
       return {posts:posts.slice(0,realLimit),hasMore:posts.length===realLimitPlusOne}
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg('id') id: number,
  ): Promise<Post | null> {
    return Post.findOne({where:{id}})
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() {req}:MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
       creatorId:req.session.userId
    }).save()
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string
  ): Promise<Post | null> {
     const post=await Post.findOne({where:{id}})
    if (!post) return null
    if (typeof title !== 'undefined') {
     await Post.update({id},{title})
    }
    return post
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number
  ): Promise<Boolean> {
    await Post.delete(id)
    return true
  }
}
