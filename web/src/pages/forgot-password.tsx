import React, { useState } from 'react'
import Wrapper from '../components/wrapper';
import { Box, Button} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import InputField from '../components/inputField';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../util/createUrqlClient';
import { useMutation } from 'urql';
import { ForgotPasswordDocument } from '../gql/graphql';


const ForgotPassword:React.FC<{}>=({})=>{
    const[complete,setComplete]=useState(false)
    const [,forgotPassword]=useMutation(ForgotPasswordDocument)
return(
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email:"" }}
        onSubmit={async (values) => {
           await forgotPassword(values)
           setComplete(true)
        }}
      >
        {({ isSubmitting }) => 
        complete ? (
        <Box>if an account with that email exists, we have sent you an email.</Box>
        ) :
        (
          <Form>
            <InputField
              type='email'
              name='email'
              label='email'
              placeholder='email'
            />
            <Button
              type='submit'
              mt='4'
              isLoading={isSubmitting}
              colorScheme='teal'
            >
              submit
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
)
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)