import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { backend_url } from '../../../../store/keyStore';


export default function ClientList() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // State to track loading status
    const [cidValues, setCidValues] = useState({}); // Map to track LOA values per client
    const [rerender, setRerender] = useState(true);
    const navigate = useNavigate();

    let it = 1;
    // Fetch clients from the backend
    useEffect(() => {
        const fetchClients = async () => {
            setIsLoading(true); // Set loading state to true before fetching
            try {
                const response = await fetch(`${backend_url}/allclient`);
                const data = await response.json();

                if (response.ok) {
                    setClients(data);
                    // Initialize loaValues state with client IDs
                    const initialLoaValues = {};
                    data.forEach((client) => {
                        initialLoaValues[client._id] = '';
                    });
                    setLoaValues(initialLoaValues);
                } else {
                    console.error('Error fetching clients:', data.error);
                }
            } catch (error) {
                console.error('Server error:', error.message);
            } finally {
                setIsLoading(false); // Set loading state to false after fetching is complete
            }
        };

        fetchClients();
    }, [rerender]);

    // Handle LOA updates
    const handleUpdateLoa = async (id) => {
        console.log('Updating LOA for User ID:', id);

        try {
            const response = await fetch(`${backend_url}/update-cid/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cid: cidValues[id] }), // Send the specific loa value
            });

            if (response.ok) {
                const data = await response.json();
                console.log('LOA updated successfully:', data);
                setCidValues("")
                setRerender(!rerender);
                alert(`LOA updated successfully for User ID: ${id}`);
            } else {
                const errorData = await response.json();
                console.error('Failed to update LOA:', errorData);
                alert(`Failed to update LOA: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error while updating LOA:', error.message);
            alert(`Error while updating LOA: ${error.message}`);
        }
    };

    // Handle LOA input changes
    const handleCidChange = (id, newCid) => {
        setCidValues((prevCidValues) => ({
            ...prevCidValues,
            [id]: newCid, // Update LOA for the specific client ID
        }));
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Spinner animation="border" variant="primary" />
                <p>Loading clients...</p>
            </div>
        );
    }

    return (
        <div className="client-table">
            <h1>Client List</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>S.no</th>
                        <th>Profile</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>CID</th>
                        <th>New CID</th>
                        <th>Update Loa</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => (
                        <tr key={client._id}>
                            <td>{it}</td>
                            <div style={{display:"none"}}>{it++}</div>
                            <td>
                                <div className="client-image-table">
                                    <img
                                        src={client.profile || '/default-profile.png'}
                                        alt={`${client.name}'s profile`}
                                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                    />
                                </div>
                            </td>
                            <td>{client.name}</td>
                            <td>{client.email}</td>
                            <td>{client.phoneNo}</td>
                            <td>{client.cid}</td>
                            <td>
                                <input
                                    type="text"
                                    value={cidValues[client._id] || ''}
                                    onChange={(e) => handleCidChange(client._id, e.target.value)}
                                    style={{
                                        border: '1px solid #adadad',
                                        background: '#ebe8e8',
                                        borderRadius: '5px',
                                    }}
                                />
                            </td>
                            <td>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleUpdateLoa(client._id)}
                                >
                                    Update
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
