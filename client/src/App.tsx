import React, { useState } from 'react';
import { Header } from './components/Header';
import { SituationInput } from './components/SituationInput';
import { ProgressiveLoader } from './components/ProgressiveLoader';
import { PriorityCards } from './components/PriorityCards';
import { CalmModeScreen } from './components/CalmModeScreen';
import { ReassessmentView } from './components/ReassessmentView';
import { ScenarioTestBench } from './components/ScenarioTestBench';
import { PrivacyPurgeModal } from './components/PrivacyPurgeModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { apiService, AnalyzeResult } from './services/api';

export const App: React.FC = () => {
  const [chaosMode, setChaosMode] = useState<'none' | '429' | 'malformed'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeResult | null>(null);
  const [isReassessing, setIsReassessing] = useState(false);

  // Modals
  const [showTestBench, setShowTestBench] = useState(false);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);

  const handleInitialSubmit = async (input: string, idempotencyKey: string) => {
    setIsLoading(true);
    setAnalyzeData(null);
    setIsReassessing(false);
    try {
      const result = await apiService.submitSituation(input, idempotencyKey, chaosMode);
      setAnalyzeData(result);
    } catch (err) {
      alert(`Submission failed: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReassessSubmit = async (updateText: string) => {
    if (!analyzeData?.situation) return;
    setIsLoading(true);
    try {
      const result = await apiService.reassessSituation(
        analyzeData.situation.id,
        updateText,
        `reassess_${Date.now()}`
      );
      setAnalyzeData(result);
      setIsReassessing(false);
    } catch (err) {
      alert(`Reassessment failed: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalyzeData(null);
    setIsReassessing(false);
  };

  const isCalmMode = analyzeData?.version.structuredResponse.mode === 'calm_safety';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      
      <Header
        chaosMode={chaosMode}
        setChaosMode={setChaosMode}
        onOpenTestBench={() => setShowTestBench(true)}
        onOpenArchitecture={() => setShowArchitecture(true)}
        onOpenPurgeModal={() => setShowPurgeModal(true)}
        isCalmMode={isCalmMode}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main>
        {!analyzeData && !isLoading && (
          <SituationInput onSubmit={handleInitialSubmit} isLoading={isLoading} />
        )}

        <ProgressiveLoader isLoading={isLoading} />

        {analyzeData && !isLoading && (
          <div>
            {/* If Emotional / At-Risk Input (Scenario 4) -> Switch to Calm Mode Screen */}
            {isCalmMode ? (
              <CalmModeScreen
                response={analyzeData.version.structuredResponse}
                onReset={handleReset}
              />
            ) : (
              <div>
                <PriorityCards
                  response={analyzeData.version.structuredResponse}
                  meta={analyzeData._meta}
                  onStartReassessment={() => setIsReassessing(true)}
                />

                {(isReassessing || analyzeData.version.version > 1) && (
                  <div style={{ marginTop: '24px' }}>
                    <ReassessmentView
                      situation={analyzeData.situation}
                      currentVersion={analyzeData.version}
                      deltaSummary={analyzeData.deltaSummary}
                      onReassessSubmit={handleReassessSubmit}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showTestBench && (
        <ScenarioTestBench
          onClose={() => setShowTestBench(false)}
          onSelectScenario={(sampleInput) => {
            handleInitialSubmit(sampleInput, `bench_${Date.now()}`);
          }}
        />
      )}

      {showArchitecture && (
        <ArchitectureModal onClose={() => setShowArchitecture(false)} />
      )}

      {showPurgeModal && (
        <PrivacyPurgeModal
          onClose={() => setShowPurgeModal(false)}
          onPurgedSuccess={handleReset}
        />
      )}

      {/* Footer */}
      <footer style={{ marginTop: '48px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        NextStep — HAZHTeq Innovations Technical Challenge (Full Stack Developer: NextStep End-to-End)
      </footer>

    </div>
  );
};
