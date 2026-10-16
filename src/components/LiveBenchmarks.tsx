import { useState, useEffect } from 'react';
import { runTests, BenchmarkResults, TestResult } from '../rubbibox-engine';

export default function LiveBenchmarks() {
  const [results, setResults] = useState<BenchmarkResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);

  const executeTests = async () => {
    setIsRunning(true);
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100));
    const benchmarkResults = await runTests();
    setResults(benchmarkResults);
    setRunCount(prev => prev + 1);
    setIsRunning(false);
  };

  useEffect(() => {
    // Auto-run on mount
    executeTests();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📊</span> Live Benchmarks
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Real execution results — no fake numbers. Run #{runCount}
          </p>
        </div>
        <button
          onClick={executeTests}
          disabled={isRunning}
          className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <span className="animate-spin">⏳</span> Running...
            </>
          ) : (
            <>▶ Re-Run Tests</>
          )}
        </button>
      </div>

      {/* Status banner */}
      {results && (
        <div className={`p-4 rounded-xl border ${
          results.passRate === 100
            ? 'bg-green-900/20 border-green-500/30'
            : 'bg-yellow-900/20 border-yellow-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{results.passRate === 100 ? '✅' : '⚠️'}</span>
            <div>
              <div className={`font-bold ${
                results.passRate === 100 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {results.passRate === 100 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}
              </div>
              <div className="text-xs text-gray-400">
                {results.passedTests}/{results.totalTests} tests passed in {results.executionTime.toFixed(2)}ms
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real metrics */}
      {results && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-4 text-center">
            <div className="text-3xl font-black text-white">{results.passedTests}</div>
            <div className="text-[10px] text-gray-500 mt-1">TESTS PASSED</div>
            <div className="text-[10px] text-gray-600">of {results.totalTests}</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-4 text-center">
            <div className={`text-3xl font-black ${
              results.passRate === 100 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {results.passRate.toFixed(0)}%
            </div>
            <div className="text-[10px] text-gray-500 mt-1">PASS RATE</div>
            <div className="text-[10px] text-gray-600">measured</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-4 text-center">
            <div className="text-3xl font-black text-cyan-400">{results.executionTime.toFixed(1)}ms</div>
            <div className="text-[10px] text-gray-500 mt-1">EXECUTION TIME</div>
            <div className="text-[10px] text-gray-600">real measurement</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-4 text-center">
            <div className="text-3xl font-black text-purple-400">
              {results.tests.find(t => t.name === 'Token Savings')?.passed ? '✓' : '✗'}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">TOKEN SAVINGS</div>
            <div className="text-[10px] text-gray-600">verified</div>
          </div>
        </div>
      )}

      {/* Individual test results */}
      {results && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
          <h4 className="text-xs font-bold text-gray-400 mb-3">INDIVIDUAL TEST RESULTS</h4>
          <div className="space-y-2">
            {results.tests.map((test, idx) => (
              <TestResultRow key={idx} test={test} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Theory vs Reality comparison */}
      {results && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
          <h4 className="text-xs font-bold text-gray-400 mb-3">THEORY vs REALITY</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-700/50">
                  <th className="text-left py-2 px-2">Metric</th>
                  <th className="text-left py-2 px-2">Theoretical</th>
                  <th className="text-left py-2 px-2">Actual</th>
                  <th className="text-left py-2 px-2">Delta</th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  metric="Token Savings"
                  theoretical="91-99%"
                  actual={results.tests.find(t => t.name === 'Token Savings')?.message || 'N/A'}
                  passed={results.tests.find(t => t.name === 'Token Savings')?.passed || false}
                />
                <ComparisonRow
                  metric="Tests Passing"
                  theoretical="100%"
                  actual={`${results.passRate.toFixed(0)}% (${results.passedTests}/${results.totalTests})`}
                  passed={results.passRate === 100}
                />
                <ComparisonRow
                  metric="Graph Nodes"
                  theoretical="11"
                  actual={`${results.tests.find(t => t.name === 'Graph Creation')?.passed ? '11' : '?'}`}
                  passed={results.tests.find(t => t.name === 'Graph Creation')?.passed || false}
                />
                <ComparisonRow
                  metric="Reuse Detection"
                  theoretical="Working"
                  actual={results.tests.find(t => t.name === 'Reuse Detection')?.message || 'N/A'}
                  passed={results.tests.find(t => t.name === 'Reuse Detection')?.passed || false}
                />
                <ComparisonRow
                  metric="Execution Time"
                  theoretical="< 100ms"
                  actual={`${results.executionTime.toFixed(2)}ms`}
                  passed={results.executionTime < 100}
                />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw data */}
      {results && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
          <h4 className="text-xs font-bold text-gray-400 mb-3">RAW MEASUREMENT DATA</h4>
          <pre className="text-[10px] text-gray-400 font-mono overflow-x-auto bg-gray-900 p-3 rounded-lg">
{JSON.stringify({
  runNumber: runCount,
  timestamp: new Date().toISOString(),
  executionTime: `${results.executionTime.toFixed(2)}ms`,
  totalTests: results.totalTests,
  passedTests: results.passedTests,
  failedTests: results.failedTests,
  passRate: `${results.passRate.toFixed(1)}%`,
  testDetails: results.tests.map(t => ({
    name: t.name,
    passed: t.passed,
    duration: `${t.duration.toFixed(2)}ms`,
    message: t.message
  }))
}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function TestResultRow({ test, index }: { test: TestResult; index: number }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
      test.passed
        ? 'bg-green-900/10 border-green-500/20'
        : 'bg-red-900/10 border-red-500/20'
    }`}>
      <span className={`text-lg ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
        {test.passed ? '✓' : '✗'}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">{test.name}</span>
          <span className="text-[10px] text-gray-500 font-mono">{test.duration.toFixed(2)}ms</span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{test.message}</div>
      </div>
    </div>
  );
}

function ComparisonRow({
  metric,
  theoretical,
  actual,
  passed
}: {
  metric: string;
  theoretical: string;
  actual: string;
  passed: boolean;
}) {
  return (
    <tr className="border-b border-gray-800/30">
      <td className="py-2 px-2 text-gray-300 font-medium">{metric}</td>
      <td className="py-2 px-2 text-gray-500">{theoretical}</td>
      <td className="py-2 px-2 text-white font-mono">{actual}</td>
      <td className="py-2 px-2">
        <span className={`px-2 py-0.5 rounded text-[10px] ${
          passed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
        }`}>
          {passed ? '✓ MATCH' : '✗ MISS'}
        </span>
      </td>
    </tr>
  );
}
