import { Dispatch, SetStateAction, useRef } from "react";
import { CodeEditor, Tab, TabList, TabPanel, TabPanels, Tabs } from ".";

export function Code({
    step,
    setStep,
    max,
    setImages,
}: {
    step: number;
    setStep: (step: number) => void;
    max: number;
    setImages: Dispatch<SetStateAction<string[]>>;
}) {
    const ref = useRef<any>();
    // const [code, setCode] = useState<string[]>([
    //     "console.log('            ')",
    //     "console.log('hello world!')",
    // ]);

    // const htmlToImage = useCallback(
    //     (index: number) => {
    //         html2canvas(ref.current).then((canvas) => {
    //             const image = canvas
    //                 .toDataURL("image/png")
    //                 .replace("image/png", "image/octet-stream");
    //             setImages((old) => {
    //                 if (old[index] === image) return old;
    //                 old[index] = image;
    //                 return [...old];
    //             });
    //         });
    //     },
    //     [setImages]
    // );

    // const handleChange = useCallback(
    //     (val: string, index: number) => {
    //         setCode((old) => {
    //             old[index] = val;
    //             return [...old];
    //         });

    //         htmlToImage(index);
    //     },
    //     [htmlToImage]
    // );

    return (
        <div
            ref={ref}
            className="max-h-[700px min-h-[500px] w-full rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-16"
        >
            <div className="flex h-full w-full flex-col space-y-5 rounded-lg bg-slate-800 p-4">
                <Tabs onChange={setStep}>
                    <TabList className="flex space-x-1">
                        {[...Array(max)].map((_, index) => (
                            <Tab
                                key={index + 1}
                                className={`h-3 w-full ${
                                    index <= step
                                        ? `bg-slate-300`
                                        : `bg-slate-600`
                                } rounded-md`}
                            />
                        ))}
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <CodeEditor />
                        </TabPanel>
                        <TabPanel>
                            <CodeEditor />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        </div>
    );
}
