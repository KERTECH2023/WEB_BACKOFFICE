import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const SendNotificationPageClient = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMessage('');
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/chauff/sendnotificationclient`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, body }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue.');
      }

      setResponseMessage(data.message);
      setTitle('');
      setBody('');
    } catch (error) {
      setIsError(true);
      setResponseMessage(error.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="list">
          <Sidebar/>
          <div className="listContainer">
            <Navbar/>
            <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Envoyer une notification client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700"
                >
                  Titre
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Entrez le titre de la notification"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="body"
                  className="text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  placeholder="Entrez le contenu de la notification"
                  className="h-32"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer'
                )}
              </Button>
            </form>

            {responseMessage && (
              <Alert
                className={`mt-4 ${
                  isError ? 'bg-red-50' : 'bg-green-50'
                }`}
              >
                <AlertDescription
                  className={`text-sm ${
                    isError ? 'text-red-800' : 'text-green-800'
                  }`}
                >
                  {responseMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
    </div>
       
  );
};

export default SendNotificationPageClient;
