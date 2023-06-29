import react from 'react';
import { Form, Formik } from 'formik';

import { Box, Button } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
import InputField from '../components/inputField';
import { useMutation } from 'urql';
import { LoginDocument} from '../gql/graphql';
import { toErrorMap } from '../util/toErrorMap';
import { useRouter } from 'next/router';

interface LoginProps {}

const Login: React.FC<{}> = () => {
  const router = useRouter()
  const [, login] = useMutation(LoginDocument);
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
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
              name='username'
              label='username'
              placeholder='username'
            />
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
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
