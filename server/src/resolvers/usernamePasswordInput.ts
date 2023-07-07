import {
  Field,
  InputType
} from 'type-graphql';


@InputType()
export class usernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;

}
