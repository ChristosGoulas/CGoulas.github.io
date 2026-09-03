import { useEffect, useEffectEvent, useRef, useState } from "react";
import "./App.css";

const initialCommands = ["whoami", "whoami -verbose", "top", "ping", "exit"];
const GITHUB_PROFILE = "https://github.com/ChristosGoulas";
const LINKEDIN_PROFILE = "https://www.linkedin.com/in/GChristos";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getTimeOfDay = () => {
  const hour = new Date().getHours();

  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  if (hour < 22) return "evening";

  return "night";
};

function App() {
const [history, setHistory] = useState([]);
const [currentInput, setCurrentInput] = useState("");
const [isProcessing, setIsProcessing] = useState(false);
const [hasExited, setHasExited] = useState(false);

  const terminalRef = useRef(null);

  // --------------------------------------------------
  // AUTO SCROLL
  // --------------------------------------------------

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop =
        terminalRef.current.scrollHeight;
    }
  }, [history, currentInput]);

  const getCommandOutput = (command) => {
    switch (command) {
      case "whoami":
        return [
          "Christos Goulas",
          "Software Engineer",
          "Athens, Greece",
        ];

      case "whoami -verbose":
        return [
          "Just a curious guy trying to understand how things work under the hood — learning by doing, breaking things, and calling it research."
        ];

      case "top":
        return [
          "Give me a problem worth solving and I'll figure out the rest.",
          "Language, framework, and tech stack? Whatever... I'll learn them.",
          "I just want to build things that matter.",
        ];

      case "ping":
        return [
          `Feel free to reach out to me on social media:`,
          `GitHub: ${GITHUB_PROFILE}`,
          `LinkedIn: ${LINKEDIN_PROFILE}`,
          "",
        ];

      case "exit":
        return [
          "Thanks for stopping by.",
          `Have a nice ${getTimeOfDay()}.`,
        ];


      default:
        return [
          `Command not found: ${command}`,
          "Type 'help' for available commands.",
        ];
    }
  };

  const typeOutput = async (lines, historyIndex) => {
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Empty line
      if (line === "") {
        setHistory((prev) => {
          const copy = [...prev];

          copy[historyIndex] = {
            ...copy[historyIndex],
            output: [...copy[historyIndex].output, ""],
          };

          return copy;
        });

        await sleep(80);
        continue;
      }

      // Add empty line first
      setHistory((prev) => {
        const copy = [...prev];

        copy[historyIndex] = {
          ...copy[historyIndex],
          output: [...copy[historyIndex].output, ""],
        };

        return copy;
      });

      // Type character by character
      for (let charIndex = 1; charIndex <= line.length; charIndex++) {
        const visibleText = line.slice(0, charIndex);

        setHistory((prev) => {
          const copy = [...prev];

          const output = [...copy[historyIndex].output];

          output[output.length - 1] = visibleText;

          copy[historyIndex] = {
            ...copy[historyIndex],
            output,
          };

          return copy;
        });

        // Fast terminal typing
        await sleep(12 + Math.random() * 18);
      }

      await sleep(60);
    }
  };

  const runCommand = async (command) => {
    if (isProcessing) return;

    setIsProcessing(true);

    const output = getCommandOutput(command);

    const historyIndex = history.length;

    setHistory((prev) => [
      ...prev,
      {
        command,
        output: [],
      },
    ]);

    setCurrentInput("");

    // Small pause before terminal starts responding
    await sleep(250);

    await typeOutput(output, historyIndex);

    if (command === "exit") {
      setHasExited(true);
    }

    setIsProcessing(false);
  };

  const renderOutputLine = (line) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = line.split(urlPattern);

    return parts.map((part, index) =>
      part.match(/^https?:\/\//) ? (
        <a
          href={part}
          key={`${part}-${index}`}
          target="_blank"
          rel="noreferrer"
        >
          {part}
        </a>
      ) : (
        part
      ),
    );
  };

  const runCommandEvent = useEffectEvent(runCommand);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      for (const command of initialCommands) {
        for (let index = 1; index <= command.length; index++) {
          if (cancelled) return;

          setCurrentInput(command.slice(0, index));
          await sleep(70 + Math.random() * 60);
        }

        await sleep(350);

        if (cancelled) return;

        await runCommandEvent(command);
        await sleep(250);
      }

    };

    boot();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      className="terminal-wrapper"
    >
      <section className="terminal">

        {/* HEADER */}
        <header className="terminal-header">

          <div className="window-buttons">
            <span className="window-button red"></span>
            <span className="window-button yellow"></span>
            <span className="window-button green"></span>
          </div>

          <span className="terminal-title">
            visitor@localhost:~$
          </span>

        </header>

        {/* BODY */}
        <div
          className="terminal-body"
          ref={terminalRef}
        >

          {/* HISTORY */}
          {history.map((item, index) => (
            <div
              className="command-block"
              key={index}
            >

              {/* COMMAND */}
              <div className="command-line">

                <span className="prompt">
                  visitor@localhost:~$
                </span>

                <span className="typed-command">
                  {" "}{item.command}
                </span>

              </div>

              {/* OUTPUT */}
              <div className="command-output">

                {item.output.map((line, lineIndex) => (
                  <div
                    key={lineIndex}
                    className={
                      lineIndex === 0 &&
                      item.command === "whoami"
                        ? "highlight"
                        : ""
                    }
                  >
                    {line ? renderOutputLine(line) : "\u00A0"}
                  </div>
                ))}

              </div>

            </div>
          ))}

          {/* CURRENT INPUT */}
{!isProcessing && !hasExited && (
  <div className="input-line">

    <span className="prompt">
      visitor@localhost:~$
    </span>

    <span className="typed-command">{" "}{currentInput}</span>

  </div>
)}
        </div>
      </section>
    </main>
  );
}

export default App;