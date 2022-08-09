import { useState, useEffect } from 'react';

export const useLoading = (): Boolean => {
    const [isLoading, setLoading] = useState < Boolean > (false)
    useEffect(() => {
        if (!isLoading) { 
            setLoading(true)
        }
        
     },[isLoading])
    return isLoading
}