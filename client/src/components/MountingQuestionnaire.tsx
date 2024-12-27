import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface MountingQuestionnaireProps {
  productData: any;
  onRequirementsComplete: (requirements: any) => void;
}

interface Question {
  id: string;
  text: string;
  description: string;
  options?: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  type?: "number" | "checkbox";
}

export default function MountingQuestionnaire({ 
  productData, 
  onRequirementsComplete 
}: MountingQuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});

  const isComputeModule = productData?.productType === 'compute_module';

  const questions: Question[] = [
    {
      id: "mountType",
      text: "How would you like to mount this?",
      description: "Choose the mounting style that best fits your setup. This affects the generated design's orientation and attachment points.",
      options: [
        { 
          value: "Wall",
          label: "Wall Mount",
          description: "Attaches to a vertical surface with secure mounting points"
        },
        {
          value: "Desktop",
          label: "Desktop Stand",
          description: "Stable base for placing on flat surfaces"
        },
        {
          value: "Under-desk",
          label: "Under-desk Mount",
          description: "Space-saving mount that attaches beneath a desk or shelf"
        },
        {
          value: "Rack",
          label: "Rack Mount",
          description: "Standard 19-inch rack mounting solution"
        },
        {
          value: "Custom",
          label: "Custom Mount",
          description: "Specify custom mounting requirements"
        }
      ],
    },
    ...(isComputeModule ? [{
      id: "cooling",
      text: "What type of cooling do you need?",
      description: "Different cooling options affect thermal performance and noise levels. Choose based on your environment and performance needs.",
      options: [
        {
          value: "Passive",
          label: "Passive",
          description: "Silent operation with heatsinks, suitable for light workloads"
        },
        {
          value: "Active",
          label: "Active (Fan)",
          description: "Better cooling performance with fans, recommended for heavy workloads"
        },
        {
          value: "Custom",
          label: "Custom",
          description: "Specify custom cooling requirements"
        }
      ],
    }] : []),
    {
      id: "orientation",
      text: "What orientation do you need?",
      description: "Device orientation affects port accessibility and cooling efficiency.",
      options: [
        {
          value: "Vertical",
          label: "Vertical",
          description: "Optimal for wall mounting and better natural convection"
        },
        {
          value: "Horizontal",
          label: "Horizontal",
          description: "Traditional desktop orientation"
        },
        {
          value: "Adjustable",
          label: "Adjustable",
          description: "Flexible positioning with adjustable angles"
        }
      ],
    },
    {
      id: "clearance",
      text: "How much clearance do you need (mm)?",
      description: "Additional space around the device for ventilation and cable management",
      type: "number",
    },
    ...(isComputeModule ? [{
      id: "accessories",
      text: "Additional features needed?",
      description: "Select additional mounting points and access requirements for peripherals",
      type: "checkbox",
      options: [
        {
          value: "GPIO",
          label: "GPIO Access",
          description: "Maintains access to GPIO pins for expansion"
        },
        {
          value: "Fan",
          label: "Fan Mount",
          description: "Additional mounting points for cooling fans"
        },
        {
          value: "Heat Sink",
          label: "Heat Sink",
          description: "Integrated heatsink mounting points"
        },
        {
          value: "Camera",
          label: "Camera Mount",
          description: "Mounting point for camera modules"
        },
        {
          value: "Display",
          label: "Display Mount",
          description: "Support for attaching a display"
        }
      ],
    }] : [])
  ].filter(Boolean) as Question[];

  const currentQuestion = questions[step];

  const handleAnswer = (value: string | string[]) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onRequirementsComplete({
        ...answers,
        [currentQuestion.id]: value,
        productType: productData.productType
      });
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h3 className="text-xl font-semibold">{currentQuestion.text}</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] p-4">
              <p>{currentQuestion.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {currentQuestion.type === "number" ? (
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Enter value in mm"
            onChange={(e) => handleAnswer(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            {currentQuestion.description}
          </p>
        </div>
      ) : currentQuestion.type === "checkbox" && currentQuestion.options ? (
        <div className="space-y-4">
          {currentQuestion.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                onCheckedChange={(checked) => {
                  const currentAnswers = answers[currentQuestion.id] || [];
                  const newAnswers = checked
                    ? [...currentAnswers, option.value]
                    : currentAnswers.filter((a: string) => a !== option.value);
                  handleAnswer(newAnswers);
                }}
              />
              <div className="flex items-center space-x-2">
                <Label htmlFor={option.value}>{option.label}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{option.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
          <Button 
            onClick={() => {
              if (step < questions.length - 1) {
                setStep(step + 1);
              } else {
                onRequirementsComplete(answers);
              }
            }}
            className="mt-4"
          >
            Next
          </Button>
        </div>
      ) : currentQuestion.options ? (
        <RadioGroup onValueChange={handleAnswer} className="space-y-4">
          {currentQuestion.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <div className="flex items-center space-x-2">
                <Label htmlFor={option.value}>{option.label}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{option.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </RadioGroup>
      ) : null}

      <div className="text-sm text-muted-foreground mt-4">
        Step {step + 1} of {questions.length}
      </div>
    </div>
  );
}