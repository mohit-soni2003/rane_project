import React from 'react';
import "./Support.css"
import "../../utility/syle.css"
import { MdAddIcCall } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const Support = () => {
    const teamMembers = [
        { name: "TEJPRAKASH RANE", position: "Director", phone: "+919826040680", email: "tejprakashrane26@gmail.com", whatsapp: "+919826040680" },
        { name: "HARSHVARDHAN RANE", position: "Chief Executive Officer (CEO)", phone: "+916264605007", email: "harshrane@icloud.com", whatsapp: "+916264605007" },
        { name: "SUNNY DEVHUNS", position: "Coordination", phone: "+916264299401", email: "1986srddevhuns@gmail.com", whatsapp: "+916264299401" },
        { name: "ASHA RANE", position: "Chief Finance Officer (CFO)", phone: "+918839094569", email: "usharane680@gmail.com", whatsapp: "+918839094569" },
        { name: "RAJESH RANE", position: "Site In-Charge", phone: "+918878521277", email: "rajeshrane751@gmail.com", whatsapp: "+918878521277" },
        { name: "LALIT DEVHUNS", position: "Supervisor", phone: "+916264295446", email: "lalitdevhans@gmail.com", whatsapp: "+916264295446" },
        { name: "MOHIT SONI", position: "Chief Technology Officer (CTO)", phone: "+919589571577", email: "mohitsonip1847@gmail.com", whatsapp: "+919589571577" }
    ];

    return (
        <div className="support-container py-5 px-5 text-black">
            {/* <h1 className="support-heading text-center mb-4 display-4 fw-bold">Contact <span>RANE AND RANE'S SONS</span></h1> */}
            <p className="text-center address-support">101, Ranipura Main Road, opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla, Nayi Bagad, Ranipura, Indore, Madhya Pradesh, India</p>
            <p className="text-center">Contact No: +91 94250 29680 | Email: sales@ranendranesons.site</p>

            <h2 className="text-center mt-5 mb-4">Meet Our Team</h2>

            <div className="row g-4 justify-content-evenly">
                {teamMembers.map((member, index) => (
                    <div key={index} className=" col-lg-4  m- d-flex justify-content-center">
                        <div className="card text-center border-0 shado rounded-4 p-3 h-100 support-card" style={{ minWidth: '320px' }}>
                            <div className="card-body">
                                <h2 className="h4 fw-bold mb-2">{member.name}</h2>
                                <p className="text-muted mb-1">{member.position}</p>

                                <div className="d-flex justify-content-start align-items-center gap-2 mb-2">
                                    <a href={`tel:${member.phone}`} className="btn btn-outline-primary rounded-circle p-2" title="Call">
                                        <MdAddIcCall style={{ fontSize: "1.5rem" }} />
                                    </a>
                                    <span>{member.phone}</span>
                                </div>

                                <div className="d-flex justify-content-start align-items-center gap-2 mb-2">
                                    <a href={`mailto:${member.email}`} className="btn btn-outline-primary rounded-circle p-2" title="Email">
                                        <MdEmail style={{ fontSize: "1.5rem" }} />
                                    </a>
                                    <span>{member.email}</span>
                                </div>

                                <div className="d-flex justify-content-start align-items-center gap-2">
                                    <a href={`https://wa.me/${member.whatsapp}`} className="btn btn-outline-success rounded-circle p-2" title="WhatsApp">
                                        <FaWhatsapp style={{ fontSize: "1.5rem" }} />
                                    </a>
                                    <span>{member.whatsapp}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-5">
                <h3 style={{color:"rgb(4, 33, 105)"}}>Better yet, see us in person!</h3>
                <p style={{color:"rgb(4, 33, 105)"}}>We stay in constant communication with our customers until the job is done. If you have questions or special requests, just drop us a line.</p>
            </div>
        </div>
    );
};

export default Support;
