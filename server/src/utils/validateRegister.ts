import { usernamePasswordInput } from "../resolvers/usernamePasswordInput";

export const validateRegister=(options:usernamePasswordInput)=>{
    if (!options.email.includes("@")) {
        return [
            {
              field: 'email',
              message: 'invalid email',
            },
          ];
        
      }
  
      if (options.username.length <= 2) {
        return [
            {
              field: 'username',
              message: 'length must be greater than 2',
            },
          ]
      }

      if (options.username.includes('@')) {
        return [
            {
              field: 'username',
              message: 'can\'t include @',
            },
          ]
      }
  
      if (options.password.length <= 2) {
        return[
            {
              field: 'password',
              message: 'length must be greater than 2',
            },
          ]
      }

      return null;
}