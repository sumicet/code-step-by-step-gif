import {
    Code,
    Steps,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "./components";

function App() {
    return (
        <div className="flex h-full w-full justify-center bg-slate-900">
            <div className="flex w-full max-w-screen-lg flex-col items-center justify-center space-y-10 p-5">
                <p className="text-3xl font-bold text-slate-300">
                    Code step-by-step gif
                </p>
                <div className="max-h-[700px min-h-[500px] w-full rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-16">
                    <div className="flex h-full w-full flex-col space-y-4 space-y-5 overflow-hidden rounded-lg bg-slate-800 p-4">
                        <Steps value={2} max={5} />
                        <Tabs>
                            <TabList>
                                <Tab>1</Tab>
                                <Tab>2</Tab>
                                <Tab>3</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>panel 1</TabPanel>
                                <TabPanel>panel 2</TabPanel>
                                <TabPanel>panel 3</TabPanel>
                            </TabPanels>
                        </Tabs>
                        <Code />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
