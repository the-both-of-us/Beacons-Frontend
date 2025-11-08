import { ChatRoom } from '@/components/chat/ChatRoom';

interface RoomPageProps {
  params: {
    roomId: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const roomId = decodeURIComponent(params.roomId);
  return <ChatRoom roomId={roomId} />;
}
