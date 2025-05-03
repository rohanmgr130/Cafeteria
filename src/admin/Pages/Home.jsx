import React from 'react'
import Nav from '../component/Nav'
import HomeDashboard from '../component/Home/HomeDashboard'
import UserManagement from '../component/Home/UserManagement'



const AdminHome = () => {
  return (
    <div>
        <Nav/>
        <HomeDashboard/>
        <UserManagement/>
    </div>
  )
}

export default AdminHome;
