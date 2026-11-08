import React, { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { fetchWithCredentials } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


const Crypto: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [result, setResult] = useState<any>('');
  const [method, setMethod] = useState<'encrypt' | 'decrypt'>('encrypt');

    const mutation = useMutation({
    mutationFn: () => fetchWithCredentials('/api/ed', { 
        headers: { 'Content-Type': 'application/json' },
        method: 'POST', 
        body: JSON.stringify({method, value: inputValue, key: encryptionKey?.trim() })
    }).then(res => res.json()),
    onSuccess: (data) => {
      setResult(data?.data || data?.error);
    },
    onError: (err) => {
      setResult(err);
    },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(); // Trigger the mutation with the input value
  };

  return (
    <div style={{ maxWidth: '500px', padding: '20px' }}>
      <h2 className='mb-10' >Encrypt / Decrypt Tool</h2>
      <form onSubmit={handleSubmit } className='space-y-6'  >
        <div>
          <Label>Encryption Key</Label> 
          <Input  value={encryptionKey} onChange={(e) => setEncryptionKey(e.target.value)} placeholder="Enter encryption key" />
        </div>

        <div>
        <Label>Text to <span className='capitalize' > {method}</span></Label>
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter text"
          required
          />
        </div>
        
    <RadioGroup className='flex gap-5' defaultValue="encrypt" onValueChange={(value) => setMethod(value as 'encrypt' | 'decrypt')}>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="encrypt" id="encrypt" />
        <Label htmlFor="encrypt">Encrypt</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="decrypt" id="decrypt" />
        <Label htmlFor="decrypt">Decrypt</Label>
      </div>
    </RadioGroup>

        <Button
          type="submit" 
        >
          {mutation.isPending ? 'Loading...' : 'Submit'}
        </Button>
      </form>

      {/* {mutation.isError && <p style={{ color: 'red' }}>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>} */}
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h4 className='text-sm mb-3' >Result:</h4>
          {/* <p>{result}</p> */}
           <div className="bg-gray-100 p-4 rounded text-sm font-mono overflow-auto max-h-[60vh] whitespace-pre-wrap break-all">
            {/* {JSON.stringify(result, null, 2)} */}
            {result}
        </div>
        </div>
      )}
    </div>
  );
};

export default Crypto;
