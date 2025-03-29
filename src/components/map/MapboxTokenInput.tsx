
import React, { useState } from 'react';
import { useMapbox } from '@/context/MapboxContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Loader2, AlertCircle } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/shared/Card';
import { toast } from 'sonner';

const MapboxTokenInput: React.FC = () => {
  const { mapboxToken, setMapboxToken, validateMapboxToken } = useMapbox();
  const [token, setToken] = useState(mapboxToken || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveToken = async () => {
    if (token.trim()) {
      if (!token.startsWith('pk.')) {
        toast.error('Invalid token format', {
          description: 'Mapbox token must start with "pk." (public token). Secret tokens (sk.*) are not allowed in client applications.',
        });
        return;
      }
      
      setIsLoading(true);
      try {
        const isValid = await validateMapboxToken(token.trim());
        if (isValid) {
          setMapboxToken(token.trim());
        } else {
          toast.error('Invalid token', {
            description: 'The token you provided appears to be invalid. Please check and try again.',
          });
        }
      } catch (error) {
        toast.error('Validation error', {
          description: 'An error occurred while validating your token. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="mr-2 h-5 w-5" />
          Mapbox API Token
        </CardTitle>
        <CardDescription>
          Required to view maps and navigation features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Important Token Information</p>
                <p className="text-amber-700 mt-1">
                  You must use a <strong>public</strong> access token (starting with pk.*), not a secret token.
                  You can get a token by signing up at{' '}
                  <a
                    href="https://www.mapbox.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    mapbox.com
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter your Mapbox public token (pk.*)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSaveToken} 
              disabled={!token.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your token will be saved in your browser's local storage.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapboxTokenInput;
