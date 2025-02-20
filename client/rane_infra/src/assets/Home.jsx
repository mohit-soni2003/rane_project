import React from 'react'
import Navpannel from './components/unique_component/Navpannel'
import BgVideo from './components/elements/BgVideo'
import Page2 from './components/elements/Page2'
import Page3 from './components/elements/Page3'
import Footer from './components/unique_component/Footer'
import AboutRane from './components/elements/AboutRane'
import BillbookForm from './components/elements/BillbookForm';
import MeetingCard from './components/elements/MeetingCard'
import Downloads from './components/elements/Downloads'
import Department from './components/elements/Department'
import ContactUs from './components/elements/ContactUs'
export default function Home() {
  return (
    <>
    <div className="main-page-container" style={{width:"100vw" , overflow:"hidden"}}>
        {/* <Navpannel></Navpannel> */}

        <BgVideo></BgVideo>
        <Page2></Page2>
        <Page3></Page3>
        <AboutRane></AboutRane>
        <Department></Department>
        <ContactUs></ContactUs>
        {/* <MeetingCard></MeetingCard> */}
        <Downloads></Downloads>
        {/* <BillbookForm></BillbookForm> */}
        <Footer></Footer>
        <div className="dev-info" style={{color:"white" , background:"rgba(0,0,0,.8)", textAlign:"center" , padding:"10px"}}>
          Website is developed and Maintained by Mohit Soni ||  <a style={{marginLeft:"10px" , textDecoration:"none"} } href="http://mohitsoni.vercel.app/">Contact Developer</a>
        </div>
    </div>
    </>
  )
}
