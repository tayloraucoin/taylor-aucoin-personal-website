import Overlay from "@/components/ui/Overlay";
import StackBody from "@/components/stack/StackBody";

export default function InterceptedStack() {
  return (
    <Overlay label="Full stack">
      <StackBody overlay />
    </Overlay>
  );
}
