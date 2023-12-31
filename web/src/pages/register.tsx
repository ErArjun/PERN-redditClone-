import React from 'react';
import { Form, Formik } from 'formik';

import { Box, Button } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
import InputField from '../components/inputField';
import { useMutation } from 'urql';
import { RegisterDocument } from '../gql/graphql';
import { toErrorMap } from '../util/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../util/createUrqlClient';

interface registerProps {}

const Register: React.FC<registerProps> = () => {
  const router = useRouter()
  const [, register] = useMutation(RegisterDocument);
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email:'',username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({options:values});
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          }else if(response.data?.register.user){
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='username'
              label='username'
              placeholder='username'
            />
            <Box mt='4'>
              <InputField
                name='email'
                label='email'
                placeholder='email'
              />
            </Box>

            <Box mt='4'>
              <InputField
                type='password'
                name='password'
                label='password'
                placeholder='password'
              />
            </Box>
            <Button
              type='submit'
              mt='4'
              isLoading={isSubmitting}
              colorScheme='teal'
            >
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
