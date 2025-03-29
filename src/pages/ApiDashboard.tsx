
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Save, RefreshCw, Key, Database, ExternalLink } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Card, { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMapbox } from '@/context/MapboxContext';
import { toast } from 'sonner';

// Define token storage keys
const MAPBOX_TOKEN_KEY = 'mapboxToken';
const API_TOKENS = 'apiTokens';

type ApiToken = {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  lastUsed: string | null;
};

const ApiDashboard = () => {
  const { mapboxToken, setMapboxToken } = useMapbox();
  const [localMapboxToken, setLocalMapboxToken] = useState(mapboxToken);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
  const [newTokenName, setNewTokenName] = useState('');
  const [activeTab, setActiveTab] = useState('mapbox');

  // Load saved API tokens from localStorage
  useEffect(() => {
    const savedTokens = localStorage.getItem(API_TOKENS);
    if (savedTokens) {
      try {
        setApiTokens(JSON.parse(savedTokens));
      } catch (e) {
        console.error('Failed to parse saved API tokens', e);
      }
    }
  }, []);

  // Save API tokens to localStorage
  useEffect(() => {
    localStorage.setItem(API_TOKENS, JSON.stringify(apiTokens));
  }, [apiTokens]);

  const handleSaveMapboxToken = () => {
    // Validate token format for Mapbox
    if (localMapboxToken && !localMapboxToken.startsWith('pk.')) {
      toast.error('Invalid Mapbox token', {
        description: 'The token should start with "pk."'
      });
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setMapboxToken(localMapboxToken);
      localStorage.setItem(MAPBOX_TOKEN_KEY, localMapboxToken);
      
      toast.success('Token saved successfully', {
        description: 'Your Mapbox token has been updated.'
      });
      
      setIsSaving(false);
    }, 800);
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        
        toast.success('Token copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy token');
      });
  };

  const generateNewToken = () => {
    if (!newTokenName.trim()) {
      toast.error('Please provide a name for your token');
      return;
    }

    // Generate a random token (this is just for demo purposes)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'tk_';
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const newToken: ApiToken = {
      id: Date.now().toString(),
      name: newTokenName,
      token: result,
      createdAt: new Date().toISOString(),
      lastUsed: null
    };

    setApiTokens([...apiTokens, newToken]);
    setNewTokenName('');
    
    toast.success('New API token created', {
      description: `Token "${newTokenName}" has been created.`
    });
  };

  const handleDeleteToken = (id: string) => {
    const updatedTokens = apiTokens.filter(token => token.id !== id);
    setApiTokens(updatedTokens);
    
    toast.success('Token deleted successfully');
  };

  return (
    <PageTransition>
      <div className="container max-w-4xl mx-auto pt-24 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold">API Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your API tokens and integrations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mapbox">
                <div className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  <span>Mapbox</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="api">
                <div className="flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  <span>API Tokens</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="mapbox" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mapbox Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mapbox-token">Token</Label>
                      <div className="flex mt-1.5">
                        <Input
                          id="mapbox-token"
                          type="text"
                          value={localMapboxToken}
                          onChange={(e) => setLocalMapboxToken(e.target.value)}
                          placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGU..."
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCopyToken(localMapboxToken)}
                          icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        >
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Your Mapbox token should begin with <code className="text-xs bg-muted px-1 py-0.5 rounded">pk.</code> and is used to display maps and calculate routes.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-between items-center pt-2">
                      <a 
                        href="https://account.mapbox.com/access-tokens/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <span>Get a token</span>
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                      
                      <Button
                        variant="primary"
                        onClick={handleSaveMapboxToken}
                        icon={isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      >
                        {isSaving ? 'Saving...' : 'Save Token'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New API Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="token-name">Token Name</Label>
                      <Input
                        id="token-name"
                        type="text"
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                        placeholder="My App Token"
                        className="mt-1.5"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        onClick={generateNewToken}
                      >
                        Generate Token
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <h3 className="text-lg font-medium mt-6 mb-3">Your API Tokens</h3>
              
              {apiTokens.length === 0 ? (
                <div className="text-center p-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">You don't have any API tokens yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiTokens.map((token) => (
                    <Card key={token.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{token.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(token.createdAt).toLocaleDateString()}
                            </p>
                            <div className="mt-2">
                              <code className="text-sm bg-muted px-2 py-1 rounded flex items-center">
                                <span className="truncate max-w-[300px]">{token.token}</span>
                              </code>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleCopyToken(token.token)}
                              icon={<Copy className="h-4 w-4" />}
                            >
                              Copy
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteToken(token.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ApiDashboard;
