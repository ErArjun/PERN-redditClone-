import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { useRouter } from "next/router";
import InputField from "../../components/inputField";
import Wrapper from "../../components/wrapper";
import { toErrorMap } from "../../util/toErrorMap";
import { useMutation } from "urql";
import { ChangePasswordDocument } from "../../gql/graphql";
import { useState } from "react";
import { createUrqlClient } from "../../util/createUrqlClient";
import { withUrqlClient } from "next-urql";
import NextLink from 'next/link'

const changePassword:React.FC=()=>{
  const router =useRouter()
  const [,changePassword]=useMutation(ChangePasswordDocument)
  const [tokenError,setTokenError]=useState("")
  return (
    <>
    <Wrapper variant='small'>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword:values.newPassword,
            token:typeof router.query.token==="string" ? router.query.token : ''
          });
          if (response.data?.changePassword.errors) {
            const errorMap=toErrorMap(response.data.changePassword.errors)
            if('token' in errorMap){
               setTokenError(errorMap.token)
            }
            setErrors(errorMap);
          }else if(response.data?.changePassword.user){
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              type='password'
              name='newPassword'
              label='New Password'
              placeholder='new password'
            />
           {tokenError? 
           <Flex>
           <Box mr={2} color={'red'}>{tokenError}</Box>
           <NextLink href='/forgot-password'>
           <Link>
           do forget again?
           </Link>
           </NextLink>
           </Flex>
           :null}


           <Box mt='2'>
            <Button
              type='submit'
              mt='4'
              isLoading={isSubmitting}
              colorScheme='teal'
            >
              change password
            </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
    </>
  )
}

export default withUrqlClient(createUrqlClient)(changePassword)