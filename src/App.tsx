import { OnboardingHero } from "./components/OnboardingHero";
import { QaPanel } from "./components/QaPanel";
import { QuestionStep } from "./components/QuestionStep";
import { ReviewCard } from "./components/ReviewCard";
import { useOnboardingFlow } from "./hooks/useOnboardingFlow";

const App = () => {
  const flow = useOnboardingFlow();

  return (
    <main className="shell" data-testid="onboarding-app">
      {flow.qaMode ? <QaPanel activeFixtureKey={flow.qaFixtureKey} pathname={flow.pathname} /> : null}

      <OnboardingHero
        activeStep={flow.activeStep}
        completionCount={flow.completionCount}
        progressValue={flow.progressValue}
        reviewStepIndex={flow.reviewStepIndex}
        onStepSelect={flow.goToStep}
      />

      <section className="workspace">
        {flow.currentQuestion ? (
          <QuestionStep
            question={flow.currentQuestion}
            answer={flow.answers[flow.currentQuestion.id]}
            error={flow.showErrors ? flow.currentError : null}
            canGoBack={flow.activeStep > 0}
            onBack={flow.goBack}
            onContinue={flow.continueStep}
            onChange={(value) => flow.setAnswer(flow.currentQuestion.id, value)}
          />
        ) : (
          <ReviewCard
            reviewSections={flow.reviewSections}
            submittedAt={flow.submittedAt}
            recommendation={flow.recommendation}
            submissionPayload={flow.submissionPayload}
            onBack={flow.goBack}
            onEditStep={flow.goToStep}
            onSubmit={flow.submit}
            onReset={flow.reset}
          />
        )}
      </section>
    </main>
  );
};

export default App;
