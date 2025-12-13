import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';

const SafeKeyGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <Container fluid className="py-4 px-0">
        <Card className="p-4 shadow border-0" style={{ backgroundColor: "var(--client-component-bg-color)" }}>
          <h5>Enter Safe Key</h5>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="mt-2"
            onClick={() => {
              if (password === 'admin123') {
                setIsAuthenticated(true);
                setError("");
              } else {
                setError('Incorrect password');
              }
            }}
          >
            Submit
          </Button>
          {error && <p className="text-danger mt-2">{error}</p>}
        </Card>
      </Container>
    );
  }

  return children;
};

export default SafeKeyGuard;