import React from 'react'
import Navpannel from './components/unique_component/Navpannel'
import BgVideo from './components/elements/BgVideo'
import Page2 from './components/elements/Page2'
import Page3 from './components/elements/Page3'
import Footer from './components/unique_component/Footer'
import AboutRane from './components/elements/AboutRane'
import BillbookForm from './components/elements/BillbookForm';
export default function Home() {
  return (
    <>
    <div className="nav-bar">
        {/* <Navpannel></Navpannel> */}

        <BgVideo></BgVideo>
        <Page2></Page2>
        <Page3></Page3>
        <AboutRane></AboutRane>
        <BillbookForm></BillbookForm>
        <Footer></Footer>
    </div>
    </>
  )
}
