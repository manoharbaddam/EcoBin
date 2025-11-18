import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card } from '../../components/common/Card/Card';
import { educationService } from '../../services/mock/educationService';
import { chatService } from '../../services/gemini/chatService';
import { EducationContent } from '../../types';

export const EducationScreen = () => {
  const [content, setContent] = useState<EducationContent[]>([]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    // Auto-scroll to latest message
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadContent = async () => {
    const data = await educationService.getEducationContent();
    setContent(data);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { from: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const botReply = await chatService.sendMessage(userMsg.text);
    setMessages((prev) => [...prev, { from: 'bot', text: botReply }]);
    setLoading(false);
  };

  const handleCloseChat = () => {
    setIsChatActive(false);
  };

  const handleOpenChat = () => {
    setIsChatActive(true);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 📚 Educational Content (hidden during chat) */}
      {!isChatActive && (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Learn About Waste</Text>
            <Text style={styles.subtitle}>
              Discover how to properly sort and dispose of different types of waste
            </Text>
          </View>

          {content.map((item) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.emoji}>{item.icon}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>

              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tips:</Text>
                {item.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.didYouKnow}>
                <Text style={styles.didYouKnowTitle}>💡 Did you know?</Text>
                <Text style={styles.didYouKnowText}>{item.didYouKnow}</Text>
              </View>
            </Card>
          ))}

          <View style={{ height: 200 }} />
        </ScrollView>
      )}

      {/* 🤖 Full Screen Chat View */}
      {isChatActive && (
        <KeyboardAvoidingView
          style={styles.fullScreenChat}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderTitle}>Eco Assistant 🌍</Text>
            <TouchableOpacity onPress={handleCloseChat} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.fullChatDisplay}
            contentContainerStyle={styles.chatContentContainer}
          >
            {messages.map((msg, i) => (
              <View
                key={i}
                style={[
                  msg.from === 'user'
                    ? styles.queryContainer
                    : styles.responseContainer,
                ]}
              >
                <View
                  style={[
                    msg.from === 'user'
                      ? styles.queryBubble
                      : styles.responseBubble,
                  ]}
                >
                  <Text
                    style={
                      msg.from === 'user'
                        ? styles.queryText
                        : styles.responseText
                    }
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}
            {loading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>♻️ Thinking...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.fullScreenInputRow}>
            <TextInput
              style={styles.fullScreenInput}
              value={input}
              placeholder="Ask something about waste or recycling..."
              onChangeText={setInput}
              placeholderTextColor={colors.text.secondary}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[
                styles.sendButton,
                !input.trim() && styles.sendButtonDisabled,
              ]}
              disabled={!input.trim() || loading}
            >
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* 💬 Sticky Chat Launcher */}
      {!isChatActive && (
        <TouchableOpacity
          style={styles.chatLauncher}
          onPress={handleOpenChat}
          activeOpacity={0.8}
        >
          <Text style={styles.launcherText}>💬 Ask Eco Assistant</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.md },
  header: { marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary },
  card: { marginBottom: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  emoji: { fontSize: 32 },
  cardTitle: { ...typography.h4, color: colors.text.primary },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  section: { marginBottom: spacing.md },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tipItem: { flexDirection: 'row', marginBottom: spacing.xs },
  bullet: { ...typography.body, color: colors.primary.main, marginRight: spacing.sm },
  tipText: { ...typography.body, color: colors.text.primary, flex: 1 },
  didYouKnow: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 12,
  },
  didYouKnowTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  didYouKnowText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },

  // 💬 Chat UI
  fullScreenChat: { flex: 1, backgroundColor: colors.background.primary },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatHeaderTitle: { ...typography.h3, color: colors.text.primary },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: { fontSize: 20, color: colors.text.primary, fontWeight: '600' },
  fullChatDisplay: { flex: 1, backgroundColor: colors.background.secondary },
  chatContentContainer: { padding: spacing.md, flexGrow: 1 },
  queryContainer: { alignItems: 'flex-end', marginBottom: spacing.sm },
  queryBubble: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    padding: spacing.md,
    maxWidth: '80%',
  },
  queryText: { ...typography.body, color: colors.text.inverse },
  responseContainer: { alignItems: 'flex-start', marginBottom: spacing.sm },
  responseBubble: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing.md,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  responseText: { ...typography.body, color: colors.text.primary },
  loadingContainer: { alignItems: 'center', paddingVertical: spacing.md },
  loadingText: { ...typography.body, color: colors.text.secondary, fontStyle: 'italic' },
  fullScreenInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background.primary,
  },
  fullScreenInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendText: { color: colors.text.inverse, fontWeight: '600' },

  // 🚀 Chat Launcher
  chatLauncher: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  launcherText: {
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 16,
  },
});
