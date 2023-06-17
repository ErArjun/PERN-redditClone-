import react from 'react';
import { Form, Formik } from 'formik';

import { Box, Button } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
import InputField from '../components/inputField';
import { useMutation } from 'urql';
import { RegisterDocument } from '../gql/graphql';
import { toErrorMap } from '../util/toErrorMap';

interface registerProps {}

const Register: React.FC<registerProps> = () => {
  const [, register] = useMutation(RegisterDocument);
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
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
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
