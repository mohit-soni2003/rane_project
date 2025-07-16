import React from 'react'
import ClientHeader from '../../component/header/ClientHeader'
import ClientSidebar from '../../component/sidebar/ClientSidebar'


export default function HomePageClient() {
  return (
    <>
    <div className='d-flex'>
        <div>
        <ClientSidebar></ClientSidebar>
        </div>

        <div>
        <ClientHeader></ClientHeader>
        </div>
    </div>
    </>
  )
}
