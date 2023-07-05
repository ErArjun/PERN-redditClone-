import { User } from '../entities/User';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME } from '../constants';

@InputType()
class usernamePassword {
  @Field()
  username: string;
  @Field()
  password: string;
}

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
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
   if (!req.session.userId) {
      return null;
    }
    const user = em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: usernamePassword,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length must be greater than 2',
          },
        ],
      };
    }

    if (options.password.length <= 5) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be greater than 5',
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);

    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
      createdAt: '',
      updatedAt: '',
    });
    try {
      await em.persistAndFlush(user);
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
    req.session.userId = user.id;
    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: usernamePassword,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
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
