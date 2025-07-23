// services/dfsService.js
import { backend_url } from "../store/keyStore";

export const uploadDocument = async ({
        fileTitle,
        fileUrl,
        docType,
        Department,
        description
    }) => {
        try {
            const res = await fetch(`${backend_url}/dfs/upload-document`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileTitle,
                    fileUrl,
                    docType,
                    Department,
                    description
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to upload document metadata');

            return data;
        } catch (err) {
            console.error('Backend Upload Error:', err);
            throw err;
        }
    };