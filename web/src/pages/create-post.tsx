import React, { useEffect } from 'react'
import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import InputField from '../components/inputField';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../util/createUrqlClient';
import { useMutation, useQuery } from 'urql';
import { CreatePostDocument, MeDocument } from '../gql/graphql';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout';
import { useIsAuth } from '../util/useIsAuth';

 const CreatePost:React.FC<{}>=({})=>{
  const router=useRouter()
  useIsAuth()
  const [,createPost]=useMutation(CreatePostDocument)
    return(
        <Layout variant='small'>
            <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
         const {error}= await createPost({input:values})
        if(!error){
          router.push("/")
         }
          
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='title'
              label='Title'
              placeholder='title'
            />
            <Box mt='4'>
              <InputField
                textarea
                name='text'
                label='Body'
                placeholder='text...'
              />
            </Box>
            <Button
              type='submit'
              mt='4'
              isLoading={isSubmitting}
              colorScheme='teal'
            >
              create post
            </Button>
          </Form>
        )}
      </Formik>

        </Layout>
    )

}

export default withUrqlClient(createUrqlClient)(CreatePost)