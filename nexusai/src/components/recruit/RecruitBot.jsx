import React from 'react'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileUp, Sparkles, UsersRound } from "lucide-react";
import CandidateCard from "./CandidateCard.jsx";
import EmailDrafter from "./EmailDrafter.jsx";
import PipelineBoard from "./PipelineBoard.jsx";
import ConfidenceBadge from "../shared/ConfidenceBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import ReasoningTrace from "../shared/ReasoningTrace.jsx";
import SkeletonCard from "../shared/SkeletonCard.jsx";
import StreamingOutput from "../shared/StreamingOutput.jsx";
import { useNexusAI } from "../../context/NexusAIContext.jsx";

const fallbackCandidate = {
  name: "Sample Candidate",
  score: 87,
  match_percent: 84,
  confidence: 87,
  summary: "Strong automation and stakeholder execution fit.",
  gaps: ["Needs deeper payroll compliance exposure", "Limited enterprise ATS migration history"],
  bias_flags: ["No protected-class language detected", "Experience-based evaluation only"],
  reasoning: [
    "Parsed resume signals against the job description requirements.",
    "Weighted automation, stakeholder management, and delivery ownership highest.",
    "Checked for biased proxies and flagged language that should be avoided.",
    "Produced score, match percentage, gaps, and interview prompts."
  ]
};

const questionSeed = [
  "Tell us about a recruiting workflow you automated end to end.",
  "How do you validate candidate quality without introducing bias?",
  "Describe a time you moved a hiring process faster without lowering standards.",
  "Which ATS metrics would you track weekly for this role?",
  "What would you do if an AI score disagreed with a human interviewer's judgment?",
  "Show a measurable example where automation reduced manual hiring effort.",
  "How would you explain a false positive or false negative to a hiring manager?",
  "Which candidate data should never be used for scoring decisions?",
  "How would you audit this recruiting agent before production use?",
  "What trade-off would you make between speed, fairness, and hiring quality?"
];

function RecruitBot({ role }) {
  const { addAlert } = useNexusAI();
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState(
    "Senior HR Automation Specialist with ATS workflows, onboarding operations, and analytics ownership."
  );
  const [candidate, setCandidate] = useState(null);
  const [sampleCandidates, setSampleCandidates] = useState([]);
  const [questions, setQuestions] = useState(questionSeed);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSamples = async () => {
      setLoading(true);
      try {
        const response = await fetch("/sample-data/resumes.json");
        const resumes = await response.json();
        if (!active) return;
        setSampleCandidates(resumes);
        const first = resumes[0];
        setCandidate({
          ...fallbackCandidate,
          name: first.name,
          score: first.score,
          match_percent: first.score,
          confidence: Math.max(72, first.score),
          summary: `${first.experience} years with ${first.skills.join(", ")}.`,
          gaps: first.score < 70 ? fallbackCandidate.gaps : ["Validate scale of automation ownership"],
          bias_flags: fallbackCandidate.bias_flags
        });
        resumes
          .filter((resume) => resume.score < 40)
          .forEach((resume) =>
            addAlert({
              id: `recruit-low-score-${resume.name}`,
              title: "Resume score below 40",
              message: `${resume.name} scored ${resume.score}; RecruitBot recommends human review before progressing.`,
              agent: "Recruit",
              module: "recruit",
              confidence: 86
            })
          );
      } catch {
        if (active) setCandidate(fallbackCandidate);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSamples();
    return () => {
      active = false;
    };
  }, [addAlert]);

  const screenCandidate = async () => {
    setApiLoading(true);
    const body = new FormData();
    body.append("jd_text", jdText);
    body.append("resume_text", resumeText);
    if (resumeFile) body.append("resume_file", resumeFile);

    try {
      const response = await fetch("/api/recruit/screen", {
        method: "POST",
        body
      });

      if (!response.ok) throw new Error("Recruit API unavailable");
      const data = await response.json();
      setCandidate({
        name: resumeFile?.name?.replace(/\.pdf$/i, "") || "Uploaded Candidate",
        score: data.score,
        match_percent: data.match_percent,
        confidence: data.confidence,
        summary: data.summary || "AI screening complete.",
        gaps: data.gaps || [],
        bias_flags: data.bias_flags || [],
        reasoning: data.reasoning || fallbackCandidate.reasoning
      });
      if ((data.score || 0) < 40) {
        addAlert({
          id: `recruit-low-score-upload-${Date.now()}`,
          title: "Resume score below 40",
          message: `${resumeFile?.name || "Uploaded candidate"} scored ${data.score}; RecruitBot recommends manual review.`,
          agent: "Recruit",
          module: "recruit",
          confidence: data.confidence || 82
        });
      }
    } catch {
      setCandidate({
        ...fallbackCandidate,
        name: resumeFile?.name?.replace(/\.pdf$/i, "") || fallbackCandidate.name
      });
    } finally {
      setApiLoading(false);
    }
  };

  const generateQuestions = async () => {
    const source = candidate?.gaps?.length ? candidate.gaps : questionSeed;
    try {
      const response = await fetch("/api/recruit/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_context: JSON.stringify(candidate || fallbackCandidate),
          gaps: source
        })
      });
      if (!response.ok) throw new Error("Recruit questions API unavailable");
      const data = await response.json();
      setQuestions(data.questions || questionSeed);
    } catch {
      setQuestions([
        `Walk us through your strongest example related to ${source[0]}.`,
        `How would you close the gap around ${source[1] || "cross-functional hiring operations"}?`,
        "What signals tell you an AI hiring recommendation needs human review?",
        "How would you measure success in the first 60 days?",
        "How would you detect biased or irrelevant resume signals?",
        "What evidence would make you override the agent's recommendation?",
        "How would you present this score to a non-technical hiring panel?",
        "What operational metric proves the workflow is worth automating?"
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
        <div>
          <p className="agent-output mb-3 text-xs uppercase tracking-[0.24em] text-blue-300">
            Recruit agent
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-normal text-[var(--text)] md:text-5xl">
            Resume intelligence
          </h1>
        </div>
        <ConfidenceBadge value={candidate?.confidence || fallbackCandidate.confidence} />
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.section
          className="glass-card hover-lift rounded-lg p-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.06, ease: "easeOut" }}
          whileHover={{ y: -2 }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
              <FileUp size={20} />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
                Screen candidate
              </h2>
              <p className="text-sm text-muted">PDF upload or pasted resume text</p>
            </div>
          </div>

          <label className="mb-4 block rounded-lg border border-dashed border-blue-400/30 bg-blue-500/10 p-4 text-sm text-blue-100">
            <span className="mb-2 block font-bold">Resume PDF</span>
            <input
              type="file"
              accept="application/pdf"
              className="w-full text-sm text-muted"
              onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
            />
          </label>

          <textarea
            className="mb-4 min-h-28 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            placeholder="Paste resume text here when a PDF is not available"
          />
          <textarea
            className="min-h-32 w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 p-4 text-sm leading-6 text-[var(--text)]"
            value={jdText}
            onChange={(event) => setJdText(event.target.value)}
            placeholder="Paste job description"
          />

          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-blue-400"
            onClick={screenCandidate}
          >
            <Sparkles size={17} />
            {apiLoading ? "Screening..." : "Run screening"}
          </button>
        </motion.section>

        {loading && <SkeletonCard lines={5} />}
        {!loading && !candidate && (
          <EmptyState icon={UsersRound} text="No candidate data loaded yet." />
        )}
        {!loading && candidate && <CandidateCard candidate={candidate} index={2} />}
      </div>

      <motion.section
        className="glass-card rounded-lg p-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.18, ease: "easeOut" }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
            Sample candidate queue
          </h3>
          <span className="agent-output text-xs text-muted">
            {role?.title || "HR"} view
          </span>
        </div>
        {loading && <SkeletonCard lines={3} />}
        {!loading && !sampleCandidates.length && (
          <EmptyState icon={UsersRound} text="No sample resumes available." />
        )}
        {!loading && sampleCandidates.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {sampleCandidates.slice(0, 8).map((resume) => (
              <button
                key={resume.name}
                type="button"
                className="rounded-lg border border-[var(--border)] bg-white/5 p-3 text-left hover:border-blue-400/40"
                onClick={() =>
                  setCandidate({
                    ...fallbackCandidate,
                    name: resume.name,
                    score: resume.score,
                    match_percent: resume.score,
                    confidence: Math.max(72, resume.score),
                    summary: `${resume.experience} years with ${resume.skills.join(", ")}.`
                  })
                }
              >
                <p className="font-bold text-[var(--text)]">{resume.name}</p>
                <p className="agent-output mt-1 text-xs text-blue-300">
                  Score {resume.score}
                </p>
              </button>
            ))}
          </div>
        )}
      </motion.section>

      <div className="grid gap-4 xl:grid-cols-2">
        <EmailDrafter
          candidateName={candidate?.name || fallbackCandidate.name}
          confidence={candidate?.confidence || fallbackCandidate.confidence}
          candidateContext={JSON.stringify(candidate || fallbackCandidate)}
        />

        <motion.section
          className="glass-card hover-lift rounded-lg p-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.24, ease: "easeOut" }}
          whileHover={{ y: -2 }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-heading text-xl font-bold tracking-normal text-[var(--text)]">
              Interview questions
            </h3>
            <button
              type="button"
              className="rounded-lg border border-blue-400/30 bg-blue-500/15 px-3 py-2 text-sm font-bold text-blue-200 hover:shadow-glow"
              onClick={generateQuestions}
            >
              Generate
            </button>
          </div>
          <StreamingOutput text={questions.join(" ")} />
          <div className="mt-4">
            <ReasoningTrace
              steps={[
                "Mapped candidate gaps to interview probes.",
                "Prioritized practical examples over generic prompts.",
                "Kept questions role-related and bias-aware."
              ]}
            />
          </div>
        </motion.section>
      </div>

      <PipelineBoard />
    </div>
  );
}

export default RecruitBot;

