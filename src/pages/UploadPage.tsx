import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
type FileStatus = 'pending' | 'uploading' | 'success' | 'error';
interface UploadableFile {
  file: File;
  progress: number;
  id: string;
  status: FileStatus;
  uploadId?: string;
}
export function UploadPage() {
  const [files, setFiles] = useState<UploadableFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      status: 'pending' as FileStatus,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    if (fileRejections.length > 0) {
      toast.error(`${fileRejections.length} file(s) were rejected.`, {
        description: 'Please check file types and sizes.',
      });
    }
  }, []);
  const activeTimers = React.useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const filesToUpload = files.filter(f => f.status === 'pending' && !activeTimers.current[f.id]);

    if (filesToUpload.length > 0) {
      setFiles(prev => prev.map(f => (filesToUpload.some(fu => fu.id === f.id) ? { ...f, status: 'uploading' } : f)));

      filesToUpload.forEach(uploadableFile => {
        activeTimers.current[uploadableFile.id] = setInterval(() => {
          setFiles(currentFiles => {
            const targetFile = currentFiles.find(f => f.id === uploadableFile.id);
            if (!targetFile || targetFile.status !== 'uploading') {
              clearInterval(activeTimers.current[uploadableFile.id]);
              delete activeTimers.current[uploadableFile.id];
              return currentFiles;
            }

            const diff = Math.random() * 20;
            const newProgress = Math.min(targetFile.progress + diff, 100);
            const isFinished = newProgress === 100;

            if (isFinished) {
              clearInterval(activeTimers.current[uploadableFile.id]);
              delete activeTimers.current[uploadableFile.id];
            }

            return currentFiles.map(f =>
              f.id === uploadableFile.id
                ? { ...f, progress: newProgress, status: isFinished ? 'success' : 'uploading' }
                : f
            );
          });
        }, 500);
      });
    }

    // Cleanup on unmount
    const currentTimers = activeTimers.current;
    return () => {
      Object.values(currentTimers).forEach(clearInterval);
    };
  }, [files]);
  const removeFile = (id: string) => {
    setFiles(files => files.filter(f => f.id !== id));
  };
  const handleStartWorkflow = async () => {
    const uploadedFiles = files.filter(f => f.status === 'success');
    if (uploadedFiles.length === 0) {
      toast.warning('No files have been successfully uploaded.');
      return;
    }
    if (uploadedFiles.length < files.length) {
      toast.warning('Please wait for all files to finish uploading.');
      return;
    }
    setIsProcessing(true);
    const promise = async () => {
      try {
        const initiateResponse = await fetch('/api/upload/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: uploadedFiles.map(f => ({ name: f.file.name, type: f.file.type, size: f.file.size }))
          })
        });
        if (!initiateResponse.ok) throw new Error('Failed to initiate upload process.');
        const initiateData = await initiateResponse.json();
        const triggerResponse = await fetch('/api/rag/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: initiateData.data.files })
        });
        if (!triggerResponse.ok) throw new Error('Failed to trigger RAG workflow.');
        const triggerData = await triggerResponse.json();
        if (!triggerData.success) throw new Error(triggerData.error || 'RAG workflow trigger failed.');
        setFiles([]);
        return triggerData.data.message;
      } finally {
        setIsProcessing(false);
      }
    };
    toast.promise(promise(), {
      loading: 'Starting RAG Workflow...',
      success: (message) => `RAG Workflow Completed! ${message}`,
      error: (err) => `Error: ${err instanceof Error ? err.message : 'An unknown error occurred.'}`,
    });
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'text/markdown': ['.md'],
    },
  });
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">
            Upload & <span className="text-gradient">Pipeline</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Ingest your documents to build a new RAG pipeline.
          </p>
        </motion.div>
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ease-in-out',
                isDragActive ? 'border-primary-accent bg-primary-accent/10 scale-105' : 'border-border hover:border-primary-accent/50 hover:bg-accent'
              )}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ scale: isDragActive ? 1.1 : 1, y: isDragActive ? -5 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="flex flex-col items-center"
              >
                <UploadCloud className="w-16 h-16 text-primary-accent mb-4" />
                <p className="text-xl font-semibold">Drag & drop files here</p>
                <p className="text-muted-foreground">or click to browse</p>
                <p className="text-sm text-muted-foreground mt-2">Supports: .txt, .pdf, .md</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Upload Queue</CardTitle>
                <CardDescription>{files.length} file(s) selected.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <AnimatePresence>
                    {files.map(uploadableFile => (
                      <motion.li
                        key={uploadableFile.id}
                        layout
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex items-center gap-4 p-3 bg-secondary rounded-lg"
                      >
                        <FileText className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{uploadableFile.file.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={uploadableFile.progress} className="w-full h-2" />
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {uploadableFile.status === 'success' ? <CheckCircle2 className="w-5 h-5 text-illustrative-green inline" /> : `${Math.round(uploadableFile.progress)}%`}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(uploadableFile.id)} className="flex-shrink-0">
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="mt-6 flex justify-end">
                  <Button
                    size="lg"
                    className="bg-btn-gradient text-primary-foreground font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out active:scale-95"
                    onClick={handleStartWorkflow}
                    disabled={isProcessing || files.length === 0}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start RAG Workflow'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}