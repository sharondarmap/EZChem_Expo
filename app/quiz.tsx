// app/quiz.tsx
import { QUIZ_MODULES, QUIZ_QUESTIONS, getQuestionsByModule } from "@/src/data/quiz";
import { reportQuizResult } from "@/src/services/progress";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QuizScreen = "modules" | "start" | "question" | "result";

export default function Quiz() {
  const router = useRouter();

  const [screen, setScreen] = useState<QuizScreen>("modules");
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [questions, setQuestions] = useState<typeof QUIZ_QUESTIONS>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // ✅ guard biar POST hasil kuis cuma sekali per attempt
  const [resultReported, setResultReported] = useState(false);

  const moduleLabel = useMemo(() => {
    if (selectedModule === null) return "";
    if (selectedModule === -1) return "Kuis Semua Modul";
    return QUIZ_MODULES[selectedModule] ?? `Modul ${selectedModule + 1}`;
  }, [selectedModule]);

  const handleModuleSelect = (moduleIndex: number) => {
    setSelectedModule(moduleIndex);

    const moduleQuestions =
      moduleIndex === -1 ? QUIZ_QUESTIONS : getQuestionsByModule(moduleIndex);

    setQuestions(moduleQuestions);
    setScreen("start");

    // reset attempt state
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setResultReported(false);
  };

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setResultReported(false);
    setScreen("question");
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (answered) return;

    setSelectedAnswer(optionIndex);
    setAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    if (optionIndex === currentQuestion.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const trackProgress = async () => {
    if (resultReported) return;
    if (!questions.length) return;

    try {
      setResultReported(true);

      // ✅ backend progress.py butuh: module, score, total
      await reportQuizResult(moduleLabel || "Kuis", score, questions.length);
    } catch (error) {
      // kalau gagal, boleh dicoba lagi kalau user restart attempt
      setResultReported(false);
      console.log("Progress tracking failed:", error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      void trackProgress();
      setScreen("result");
    }
  };

  const handleRestart = () => {
    if (selectedModule !== null) {
      handleModuleSelect(selectedModule);
    }
  };

  const handleBackToModules = () => {
    setScreen("modules");
    setSelectedModule(null);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      {screen === "modules" && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Pilih Modul Kuis</Text>
            <Text style={styles.subtitle}>Pilih modul yang ingin Anda uji</Text>
          </View>

          <View style={styles.modulesGrid}>
            {QUIZ_MODULES.map((moduleName, index) => (
              <TouchableOpacity
                key={index}
                style={styles.moduleCard}
                onPress={() => handleModuleSelect(index)}
              >
                <Text style={styles.moduleTitle}>{moduleName}</Text>
                <Text style={styles.moduleQuestions}>10 Soal</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.allModulesBtn} onPress={() => handleModuleSelect(-1)}>
            <Text style={styles.allModulesBtnText}>Kuis Semua Modul (110 Soal)</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {screen === "start" && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Kuis Kimia</Text>
            <Text style={styles.subtitle}>
              {selectedModule === -1 ? "Semua Modul - 110 Soal" : `${moduleLabel} - 10 Soal`}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleStartQuiz}>
              <Text style={styles.primaryBtnText}>Mulai Kuis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleBackToModules}>
              <Text style={styles.secondaryBtnText}>Kembali ke Menu</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {screen === "question" && currentQuestion && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.quizHeader}>
            <Text style={styles.questionCounter}>
              {currentQuestionIndex + 1} / {questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.answerOptions}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  disabled={answered}
                  onPress={() => handleAnswerSelect(index)}
                  style={[
                    styles.answerOption,
                    selectedAnswer === index && styles.answerSelected,
                    answered && index === currentQuestion.correctAnswer && styles.answerCorrect,
                    answered &&
                      selectedAnswer === index &&
                      index !== currentQuestion.correctAnswer &&
                      styles.answerIncorrect,
                  ]}
                >
                  <Text
                    style={[
                      styles.answerText,
                      selectedAnswer === index && styles.answerSelectedText,
                      answered && index === currentQuestion.correctAnswer && styles.answerCorrectText,
                      answered &&
                        selectedAnswer === index &&
                        index !== currentQuestion.correctAnswer &&
                        styles.answerIncorrectText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {answered && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>Penjelasan:</Text>
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              </View>
            )}
          </View>

          {answered && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleNextQuestion}>
              <Text style={styles.primaryBtnText}>
                {currentQuestionIndex === questions.length - 1 ? "Lihat Hasil" : "Selanjutnya"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {screen === "result" && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Hasil Kuis</Text>
            <Text style={styles.subtitle}>{moduleLabel}</Text>
          </View>

          <View style={styles.resultContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.finalScore}>{score}</Text>
              <Text style={styles.scoreTotal}>/ {questions.length}</Text>
            </View>

            <Text style={styles.resultMessage}>
              {questions.length > 0 && score / questions.length >= 0.8
                ? "🎉 Luar Biasa!"
                : questions.length > 0 && score / questions.length >= 0.6
                ? "✓ Bagus!"
                : "△ Perlu Belajar Lagi"}
            </Text>

            <Text style={styles.percentageText}>
              Persentase: {questions.length ? Math.round((score / questions.length) * 100) : 0}%
            </Text>

            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleRestart}>
                <Text style={styles.primaryBtnText}>Ulangi Kuis</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleBackToModules}>
                <Text style={styles.secondaryBtnText}>Pilih Modul Lain</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1419" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: "center", paddingVertical: 20, paddingHorizontal: 16 },
  title: { fontSize: 28, color: "#64b5f6", fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#b0bec5", textAlign: "center" },

  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  moduleCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  moduleTitle: {
    fontSize: 14,
    color: "#64b5f6",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  moduleQuestions: { fontSize: 12, color: "#b0bec5" },
  allModulesBtn: {
    marginHorizontal: 16,
    backgroundColor: "#42a5f5",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  allModulesBtnText: { color: "#fff", fontWeight: "700" },

  actionButtons: { gap: 12, marginHorizontal: 16, marginTop: 20 },

  quizHeader: { paddingHorizontal: 16, marginBottom: 20 },
  questionCounter: { fontSize: 14, color: "#64b5f6", fontWeight: "600", marginBottom: 8 },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#64b5f6" },

  questionContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    color: "#e3f2fd",
    fontWeight: "600",
    marginBottom: 16,
    lineHeight: 22,
  },

  answerOptions: { gap: 10, marginBottom: 16 },
  answerOption: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  answerSelected: { backgroundColor: "rgba(100, 181, 246, 0.2)", borderColor: "#64b5f6" },
  answerCorrect: { backgroundColor: "rgba(76, 175, 80, 0.2)", borderColor: "#4caf50" },
  answerIncorrect: { backgroundColor: "rgba(244, 67, 54, 0.2)", borderColor: "#f44336" },
  answerText: { fontSize: 14, color: "#e3f2fd" },
  answerSelectedText: { color: "#64b5f6", fontWeight: "600" },
  answerCorrectText: { color: "#4caf50", fontWeight: "600" },
  answerIncorrectText: { color: "#f44336", fontWeight: "600" },

  explanationBox: {
    backgroundColor: "rgba(100, 181, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(100, 181, 246, 0.3)",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  explanationTitle: { fontSize: 12, color: "#64b5f6", fontWeight: "700", marginBottom: 6 },
  explanationText: { fontSize: 13, color: "#b0bec5", lineHeight: 18 },

  resultContainer: { alignItems: "center", marginTop: 20, marginHorizontal: 16 },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(100, 181, 246, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#64b5f6",
  },
  finalScore: { fontSize: 40, color: "#fff", fontWeight: "700" },
  scoreTotal: { fontSize: 14, color: "#b0bec5" },
  resultMessage: { fontSize: 18, color: "#e3f2fd", fontWeight: "600", marginBottom: 12 },
  percentageText: { fontSize: 14, color: "#b0bec5", marginBottom: 24 },

  resultActions: { width: "100%", gap: 12 },

  primaryBtn: {
    backgroundColor: "#42a5f5",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  secondaryBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#e3f2fd", fontWeight: "700", fontSize: 14 },
});
