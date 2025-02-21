import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { USER_API_END_POINT } from "@/constants";
import { toast } from "sonner";
import axios from "axios";
import { setUser } from "@/redux/authSlice";

const UpdateProfileDialog = ({ open, setOpen }) => {

    const [loading, setLoading] = useState(false)
    const {user} = useSelector(store => store.auth)

    const dispatch = useDispatch()

    const [input, setInput] = useState({
        fullName: user?.fullName,
        email: user?.email,
        username: user?.username,
        phoneNumber: user?.phoneNumber,
        bio: user?.profile?.bio,
        skills: user?.profile?.skills?.map(skill => skill),
        resume: user?.profile?.resume
    })

    const changeEventHandler = (e) => {
      setInput({...input, [e.target.name] : e.target.value})
    }

    const changeFileHandler = (e) => {
      setInput({...input, resume: e.target.files?.[0]})
    }

    const submitHandler = async (e) => {
      e.preventDefault()
      setLoading(true)
      const formData = new FormData()
      Object.entries(input).forEach(([key, value]) => {
        if(key === "resume" && value){
          formData.append("file", value);
        } else{
          formData.append(key, value)
        }
      })
      try {
        const res = await axios.patch(`${USER_API_END_POINT}/update-profile`, formData, {
          headers: {
            "Content-Type":"multipart/form-data"
          },
          withCredentials: true
        })
        if(res.data.success) {
          dispatch(setUser(res.data.data))
          toast.success(res.data.message)
        }
      } catch (error) {
        console.log(error)
        // toast.error(error.response.data.message)
      } finally{
        setLoading(false)
        setOpen(false)
      }
    }
  return (
    <div>
      <Dialog open={open}>
        <DialogContent onInteractOutside = {() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitHandler}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullName" className="text-right">
                  Full Name
                </Label>
                <Input id="fullName" name="fullName" value={input.fullName} onChange={changeEventHandler} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" name="email" value={input.email} onChange={changeEventHandler} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input id="username" name="username" value={input.username} onChange={changeEventHandler} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">
                  Phone Number
                </Label>
                <Input id="phoneNumber" name="phoneNumber" value={input.phoneNumber} onChange={changeEventHandler} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">
                  Bio
                </Label>
                <Input id="bio" name="bio" value={input.bio} onChange={changeEventHandler} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skills" className="text-right">
                  Skills
                </Label>
                <Input id="skills" name="skills" value={input.skills} onChange={changeEventHandler} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resume" className="text-right">
                  Resume
                </Label>
                <Input id="resume" name="resume" type="file" accept="application/pdf" onChange={changeFileHandler} className="col-span-3" />
              </div>
            </div>
            {
                loading ? (
                    <Button className ="w-full my-4"><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                    </Button>
                ) : (
                    <Button type="submit" className="w-full my-4">
                        Save Changes
                    </Button>
                )
            }
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateProfileDialog;
