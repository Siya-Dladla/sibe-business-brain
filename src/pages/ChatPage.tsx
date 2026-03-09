import { AppLayout } from "@/components/AppLayout";
import SibeChat from "@/components/SibeChat";

const ChatPage = () => {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">Chat with Sibe</h1>
          <p className="text-sm text-muted-foreground mt-1">Ask questions about your business data</p>
        </div>
        <SibeChat />
      </div>
    </AppLayout>
  );
};

export default ChatPage;
