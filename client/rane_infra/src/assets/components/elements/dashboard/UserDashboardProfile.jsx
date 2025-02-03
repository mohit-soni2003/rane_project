import React from "react";
import "./UserDashboardProfile.css";
import { useAuthStore } from "../../store/authStore";


const UserDashboardProfile = () => {

      const {user } = useAuthStore();
    
 return( 
    <>
    <div className="user-dashboard-profile">
        <div className="dash-profile-data">
            <img src={user.profile} alt="" />
            <table>
                <tr>
                    <td>Name : </td>
                    <td>{user.name} </td>
                </tr>
                <tr>
                    <td>Email : </td>
                    <td>{user.email}</td>
                </tr>
                <tr>
                    <td>Contact No :</td>
                    <td>{user.phoneno ? user.phoneno : 'N/A'}</td>
                    
                </tr>
                <tr>
                    <td>Your CID code: </td>
                    <td>{user.cid}</td>
                </tr>
            </table>
        </div>
    </div>
    </>
 )
};

export default UserDashboardProfile;
