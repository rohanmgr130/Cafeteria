  import React from 'react'
  import Nav from "../components/Nav";
  import Category from "../components/Home/Category";
  import TodaysSpecial from "../components/Home/TodaysSpecial";
  import MenuHome from "../components/Home/OurMenu";
  import Footer from "../components/FooterPart";
import Search from '../components/Home/Search';





  const Home = () => {
    return (
      <>
        <Nav/>
        <Search/>
        <Category/>
        <TodaysSpecial/>
        <MenuHome/>
        
        

        
        <Footer/>
      </>
    )
  }

  export default Home
