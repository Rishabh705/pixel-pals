import React, { useRef, useState, useEffect, useCallback, MouseEvent } from 'react';
import MaxWidthWrapper from './MaxWidthWrapper';
import { socket } from '@/lib/socket'; // Adjust the import path as necessary
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/rtk/hooks';

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [searchParams] = useSearchParams()
  const userId:string|null = useAppSelector(state => state.auth.userId)
  const reciever:string = searchParams.get('re') || ''


  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight;
        if (parentWidth && parentHeight) {
          canvas.width = parentWidth;
          canvas.height = parentHeight;
        }
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.strokeStyle = 'black';
      }

      resizeCanvas();

      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [resizeCanvas]);

  useEffect(() => {
    if(userId){
      socket.emit('register-user', userId)
    }
    const handleDrawingEvent = (data: { x: number; y: number; type: string, reciever: string }) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          if (data.type === 'start') {
            context.beginPath();
            context.moveTo(data.x, data.y);
          } else if (data.type === 'draw') {
            context.lineTo(data.x, data.y);
            context.stroke();
          }
        }
      }
    };

    socket.on('drawing', handleDrawingEvent);

    return () => {
      socket.off('drawing', handleDrawingEvent);
    };
  }, []);

  const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.beginPath();
        context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
        socket.emit('drawing', { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, type: 'start', reciever: reciever });
      }
    }
  };

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        context.stroke();
        socket.emit('drawing', { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, type: 'draw', reciever: reciever });
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <MaxWidthWrapper>
      <div className='mt-4 h-[900px] flex-1 rounded-lg'>
        <canvas
          ref={canvasRef}
          className='border rounded-lg w-full'
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </MaxWidthWrapper>
  );
};

export default Whiteboard;
