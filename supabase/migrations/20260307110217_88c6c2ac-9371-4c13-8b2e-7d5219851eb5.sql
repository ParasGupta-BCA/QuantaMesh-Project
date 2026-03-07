CREATE POLICY "Users can update metadata on messages in their conversations"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  sender_type = 'admin' AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
)
WITH CHECK (
  sender_type = 'admin' AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);