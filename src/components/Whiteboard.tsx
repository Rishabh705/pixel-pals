import React from 'react';
import MaxWidthWrapper from './MaxWidthWrapper';
import { useSearchParams } from 'react-router-dom';
import { Tldraw } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'


const Whiteboard: React.FC = () => {
  const [searchParams] = useSearchParams()
  const chat_id: string = searchParams.get('chat_id') || ''
  const store = useSyncDemo({ roomId: chat_id })
  return (
    <MaxWidthWrapper>
      <div style={{ position: 'fixed', inset: 0 }}>
        <Tldraw store={store}/>
      </div>
    </MaxWidthWrapper>
  );
};

export default Whiteboard;
