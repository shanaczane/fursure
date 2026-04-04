import ChatBot from "@/app/components/owner-dashboard/components/ChatBot";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ChatBot />
    </>
  );
}
