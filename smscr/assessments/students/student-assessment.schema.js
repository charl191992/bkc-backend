import mongoose from "mongoose";

const studentChoiceSchema = new mongoose.Schema({
  text: { type: String, required: false },
  image: {
    filename: { type: String, required: false },
    path: { type: String, required: false },
    original_name: { type: String, required: false },
    size: { type: Number, required: false },
  },
});

const studentAssessmentSectionQuestionSchema = new mongoose.Schema({
  question: {
    text: { type: String, required: false },
    image: {
      filename: { type: String, required: false },
      path: { type: String, required: false },
      original_name: { type: String, required: false },
      size: { type: Number, required: false },
    },
  },
  choices: [studentChoiceSchema],
  answer: { type: String, required: false },
  studentAnswer: { type: String, required: false },
});

const studentAssessmentSectionSchema = new mongoose.Schema({
  instruction: { type: String, required: true },
  questions: [studentAssessmentSectionQuestionSchema],
});

const studentAssessmentSchema = new mongoose.Schema(
  {
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["multiple choice", "short answer"],
      required: true,
    },
    level: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
    subject: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
    sections: [studentAssessmentSectionSchema],
    code: { type: Number, required: true },
    taken: { type: Boolean, default: false },
    stats: {
      correct: { type: Number },
      incorrect: { type: Number },
      unanswered: { type: Number },
      score: { type: Number },
    },
    duration: {
      start: { type: Date },
      end: { type: Date },
    },
  },
  { timestamps: true }
);

studentAssessmentSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.$set?.taken === true) {
    const assessment = await this.model.findOne(this.getQuery()).select("sections.questions.studentAnswer sections.questions.answer duration.end").lean();

    if (!assessment) {
      return next(new Error("Assessment not found"));
    }

    const stats = {
      correct: 0,
      incorrect: 0,
      unanswered: 0,
    };

    assessment.sections?.forEach(section => {
      section.questions?.forEach(question => {
        if (!question.studentAnswer) {
          stats.unanswered++;
        } else {
          const isCorrect = String(question.studentAnswer).toLowerCase().trim() === String(question.answer).toLowerCase().trim();
          isCorrect ? stats.correct++ : stats.incorrect++;
        }
      });
    });

    update.$set.stats = {
      ...stats,
      score: Math.round((stats.correct / Math.max(1, stats.correct + stats.incorrect + stats.unanswered)) * 100),
    };

    if (!assessment.duration.end) {
      update.$set["duration.end"] = new Date().toISOString();
    }
  }

  next();
});

const StudentAssessment = mongoose.model("StudentAssessment", studentAssessmentSchema);

export default StudentAssessment;
