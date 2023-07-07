import { User } from '../entities/User';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { usernamePasswordInput } from './usernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid'

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {

  @Mutation(()=>UserResponse)
  async changePassword(
    @Arg('token') token:string,
    @Arg('newPassword') newPassword:string,
    @Ctx(){redis,req}:MyContext
  ): Promise<UserResponse>{
    if (newPassword.length <= 2) {
      return{
     errors: [
          {
            field: 'newPassword',
            message: 'length must be greater than 2',
          },
        ]
    }
  }
  const key=FORGOT_PASSWORD_PREFIX+token
    const userId= await redis.get(key)
    if(!userId){
      return{
        errors:[
          {
            field:"token",
            message:"token expired"
          }
        ]
      }
    }
    const id=parseInt(userId)
    const user= await User.findOne({where:{id}}) 

    if(!user){
      return{
        errors:[
          {
            field:"token",
            message:"user no longer exists"
          }
        ]
      }
    }

    const hashedPassword = await argon2.hash(newPassword);
    await User.update({id:id},{password:hashedPassword})

    await redis.del(key)
 
    //login user after password change
    req.session.userId=user.id
    
    return {user}
}
  
@Mutation(()=>Boolean)
 async forgotPassword(
  @Arg("email") email:string,
  @Ctx() {redis}: MyContext
  ){
    const user=await User.findOne({where:{email}})
    if(!user){
      //email not in the database
      return true
    }
    const token=v4()
    await redis.set(FORGOT_PASSWORD_PREFIX+token,user.id,"EX",1000*60*60*24) //expire after 1 day
    await sendEmail(email,`<a href="http://localhost:3000/change-password/${token}">reset password</a>`)
  return true
  }




  @Query(() => User, { nullable: true })
  me(@Ctx() { req}: MyContext) {
   if (!req.session.userId) {
      return null;
    }
      return User.findOne({where:{id:req.session.userId}})
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: usernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {

   const errors=validateRegister(options)
   let user
   if(errors){
    return {errors}
   }
    const hashedPassword = await argon2.hash(options.password);
    try {

      user= await User.create({
        username: options.username,
       password: hashedPassword,
       email:options.email
      }).save()

      //  const result = await dataSource createQueryBuilder().insert().into(User).values(
      //     {  
      //       username: options.username,
      //       password: hashedPassword,
      //       email:options.email
      //      }
      // ).returning("*").execute()
      //  user=result.raw[0]

     
    } catch (err) {
      if (err.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }
    req.session.userId = user?.id;
    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password:string,
    @Ctx() {req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
       usernameOrEmail.includes('@') 
       ? {where:{email:usernameOrEmail}}
       :{where:{username:usernameOrEmail}}
       );

    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password,password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
    }
    req.session.userId = user.id;
    return {
      user,
    };
  }

  @Mutation(()=>Boolean)
  logout(
    @Ctx(){req,res}:MyContext
  ){
    
    return new Promise ((resolve)=>
    req.session.destroy((err)=>{
      res.clearCookie(COOKIE_NAME)
      if(err){
        console.log(err)
        resolve(false)
        return
      }
      resolve(true)
    }))
  }
}
