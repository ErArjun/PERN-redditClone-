import React from 'react'
import Wrapper, { WrapperVariant } from './wrapper'
import { NavBar } from './NavBar'

interface LayoutProps{
    variant?:WrapperVariant
    children: React.ReactNode
}

export const Layout:React.FC<LayoutProps>=({children,variant})=>{
return (
    <>
    <NavBar/>
    <Wrapper variant={variant}> 
        {children}
    </Wrapper>
    </>
)
}