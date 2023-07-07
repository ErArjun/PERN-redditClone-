import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import InputField from '../components/inputField';
import { useMutation } from 'urql';
import { LoginDocument} from '../gql/graphql';
import { toErrorMap } from '../util/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../util/createUrqlClient';
import NextLink from 'next/link'
import Wrapper from '../components/wrapper';

interface LoginProps {}

const Login: React.FC<{}> = () => {
  const router = useRouter()
  const [, login] = useMutation(LoginDocument);
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          }else if(response.data?.login.user){
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              type='text'
              name='usernameOrEmail'
              label='username or email'
              placeholder='Username or Email'
            />
            <Box mt='4'>
              <InputField
                type='password'
                name='password'
                label='password'
                placeholder='password'
              />
            </Box>
            <Flex justifyContent={'flex-end'}>
            <NextLink href='/forgot-password'>
           <Link>
            forgot password?
           </Link>
           </NextLink>
           </Flex>
            <Button
              type='submit'
              mt='4'
              isLoading={isSubmitting}
              colorScheme='teal'
            >
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
