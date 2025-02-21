import React from 'react';
import "./Support.css"
import { MdAddIcCall } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const Support = () => {
    const teamMembers = [
        { name: "John Doe", position: "Marketing Manager", description: "Passionate about building long-lasting client relationships.", phone: "+1234567890", email: "john@xyz.com", whatsapp: "+1234567890" },
        { name: "Jane Smith", position: "Customer Support Lead", description: "Dedicated to ensuring customer satisfaction and quick responses.", phone: "+0987654321", email: "jane@xyz.com", whatsapp: "+0987654321" },
        { name: "Alex Johnson", position: "Technical Support", description: "Expert in troubleshooting and solving technical issues.", phone: "+1122334455", email: "alex@xyz.com", whatsapp: "+1122334455" }
    ];

    return (
        <div className="support-container py-5 px-5 text-black">
            <h1 className="support-heading text-center mb-4 display-4 fw-bold">Meet Our <span className="">Support Team</span></h1>

            <div className="row g-4">
                {teamMembers.map((member, index) => (
                    <div key={index} className="col-12 col-md-6 col-lg-4 my-5">
                        <div className="card text-center border-0 shado w-lg rounded-4 p-3 h-100 support-card ">
                            <div className="card-body">
                                <h2 className="h4 fw-bold mb-2">{member.name}</h2>
                                <p className="text-muted mb-1">{member.position}</p>
                                <p className="text-secondary mb-3">{member.description}</p>
                                
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
        </div>
    );
};

export default Support;
